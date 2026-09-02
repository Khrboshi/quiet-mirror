--
-- PostgreSQL database dump
--

\restrict a43u2YvT8MPFUG8DaQqQGykS1fRoERXdiIafiZyAlbPS1dqh3fa2iMlPMo8k0OH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Ubuntu 17.11-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: consume_free_credit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.consume_free_credit(uid uuid) RETURNS integer
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  remaining integer;
begin
  update public.user_credits
  set credits = credits - 1,
      updated_at = now()
  where user_id = uid
    and credits > 0
  returning credits into remaining;

  if remaining is null then
    return -1; -- limit reached (no decrement happened)
  end if;

  return remaining;
end;
$$;


--
-- Name: consume_reflection_credit(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.consume_reflection_credit(p_amount integer DEFAULT 1) RETURNS TABLE(remaining_credits integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare uid uuid; plan text;
begin
  uid := auth.uid();
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'invalid_amount'; end if;
  insert into public.user_credits (user_id, plan_type, remaining_credits, updated_at, renewal_date)
  values (uid, 'FREE', 3, now(), null) on conflict (user_id) do nothing;
  select uc.plan_type into plan from public.user_credits uc where uc.user_id = uid for update;
  if plan in ('PREMIUM', 'TRIAL', 'EARLY_ACCESS') then
    return query select uc.remaining_credits from public.user_credits uc where uc.user_id = uid;
    return;
  end if;
  update public.user_credits uc set remaining_credits = uc.remaining_credits - p_amount, updated_at = now()
  where uc.user_id = uid and uc.remaining_credits >= p_amount
  returning uc.remaining_credits into remaining_credits;
  if remaining_credits is null then return; end if;
  return query select remaining_credits;
end;
$$;


--
-- Name: decrement_user_credit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_user_credit(uid uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
  update user_credits
  set credits = greatest(credits - 1, 0)
  where user_id = uid;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  insert into public.user_profiles (id, tier, subscription_status)
  values (new.id, 'free', 'inactive');
  return new;
end;
$$;


--
-- Name: handle_new_user_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  insert into public.user_credits (user_id, plan_type, remaining_credits, updated_at, renewal_date)
  values (new.id, 'FREE', 3, now(), null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;


--
-- Name: protect_entitlement_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_entitlement_fields() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  if auth.uid() is not null then
    if TG_OP = 'INSERT' and new.plan_type <> 'FREE' then
      raise exception 'plan_changes_must_be_server_authorized';
    end if;
    if TG_OP = 'UPDATE' and (
      new.plan_type is distinct from old.plan_type or
      new.trial_started_at is distinct from old.trial_started_at or
      new.trial_ends_at is distinct from old.trial_ends_at or
      new.early_access_ends_at is distinct from old.early_access_ends_at or
      new.billing_provider is distinct from old.billing_provider or
      new.subscription_id is distinct from old.subscription_id or
      new.plan_changed_at is distinct from old.plan_changed_at
    ) then
      raise exception 'plan_changes_must_be_server_authorized';
    end if;
  end if;
  return new;
end;
$$;


--
-- Name: record_plan_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_plan_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  if TG_OP = 'UPDATE' and new.plan_type is distinct from old.plan_type then
    insert into public.plan_history(user_id, old_plan_type, new_plan_type, reason, changed_by)
    values (new.user_id, old.plan_type, new.plan_type, null, 'SYSTEM');
  end if;
  return new;
end;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id bigint NOT NULL,
    user_id uuid,
    event text NOT NULL,
    source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.analytics_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    tx_type text NOT NULL,
    related_feature text,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credit_transactions_tx_type_check CHECK ((tx_type = ANY (ARRAY['PURCHASE'::text, 'USAGE'::text, 'ADJUSTMENT'::text])))
);


--
-- Name: email_subscribe_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_subscribe_attempts (
    id bigint NOT NULL,
    ip text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_subscribe_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_subscribe_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_subscribe_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_subscribe_attempts_id_seq OWNED BY public.email_subscribe_attempts.id;


--
-- Name: email_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    source text DEFAULT 'blog'::text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now() NOT NULL,
    unsubscribed_at timestamp with time zone
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    mood integer,
    title text,
    content text,
    ai_response text,
    CONSTRAINT journal_entries_mood_check CHECK (((mood >= 1) AND (mood <= 5)))
);


--
-- Name: plan_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    old_plan_type text,
    new_plan_type text NOT NULL,
    reason text,
    changed_by text DEFAULT 'SYSTEM'::text,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plan_history_new_plan_type_check CHECK ((new_plan_type = ANY (ARRAY['FREE'::text, 'ESSENTIAL'::text, 'PREMIUM'::text]))),
    CONSTRAINT plan_history_old_plan_type_check CHECK ((old_plan_type = ANY (ARRAY['FREE'::text, 'ESSENTIAL'::text, 'PREMIUM'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    display_name text,
    main_focus text,
    stripe_customer_id text,
    weekly_summary text,
    weekly_summary_generated_at timestamp with time zone,
    dodo_customer_id text,
    dodo_subscription_id text,
    weekly_summary_locale text
);


--
-- Name: reflection_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reflection_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: upgrade_intents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upgrade_intents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credits (
    user_id uuid NOT NULL,
    plan_type text DEFAULT 'FREE'::text NOT NULL,
    remaining_credits integer DEFAULT 3 NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    renewal_date timestamp with time zone,
    trial_started_at timestamp with time zone,
    trial_ends_at timestamp with time zone,
    early_access_ends_at timestamp with time zone,
    billing_provider text,
    subscription_id text,
    plan_changed_at timestamp with time zone,
    CONSTRAINT user_credits_credits_check CHECK ((remaining_credits >= 0)),
    CONSTRAINT user_credits_plan_type_check CHECK ((plan_type = ANY (ARRAY['FREE'::text, 'TRIAL'::text, 'PREMIUM'::text, 'EARLY_ACCESS'::text])))
);


--
-- Name: user_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_type text DEFAULT 'FREE'::text NOT NULL,
    credits_balance integer DEFAULT 0 NOT NULL,
    renewal_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    trial_started_at timestamp with time zone,
    trial_ends_at timestamp with time zone,
    early_access_ends_at timestamp with time zone,
    billing_provider text,
    subscription_id text,
    plan_changed_at timestamp with time zone,
    CONSTRAINT user_plans_plan_type_check CHECK ((plan_type = ANY (ARRAY['FREE'::text, 'TRIAL'::text, 'PREMIUM'::text, 'EARLY_ACCESS'::text])))
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    tier text DEFAULT 'free'::text,
    subscription_status text DEFAULT 'inactive'::text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_profiles_tier_check CHECK ((tier = ANY (ARRAY['free'::text, 'paid'::text, 'early_access'::text])))
);


--
-- Name: email_subscribe_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscribe_attempts ALTER COLUMN id SET DEFAULT nextval('public.email_subscribe_attempts_id_seq'::regclass);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: email_subscribe_attempts email_subscribe_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscribe_attempts
    ADD CONSTRAINT email_subscribe_attempts_pkey PRIMARY KEY (id);


--
-- Name: email_subscribers email_subscribers_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscribers
    ADD CONSTRAINT email_subscribers_email_unique UNIQUE (email);


--
-- Name: email_subscribers email_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscribers
    ADD CONSTRAINT email_subscribers_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: plan_history plan_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_history
    ADD CONSTRAINT plan_history_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reflection_usage reflection_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_usage
    ADD CONSTRAINT reflection_usage_pkey PRIMARY KEY (id);


--
-- Name: upgrade_intents upgrade_intents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upgrade_intents
    ADD CONSTRAINT upgrade_intents_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (user_id);


--
-- Name: user_plans user_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_pkey PRIMARY KEY (id);


--
-- Name: user_plans user_plans_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_user_unique UNIQUE (user_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: analytics_events_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_events_event_idx ON public.analytics_events USING btree (event);


--
-- Name: analytics_events_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_events_user_id_idx ON public.analytics_events USING btree (user_id);


--
-- Name: email_subscribe_attempts_ip_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_subscribe_attempts_ip_created_at_idx ON public.email_subscribe_attempts USING btree (ip, created_at);


--
-- Name: email_subscribers_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email_subscribers_email_idx ON public.email_subscribers USING btree (lower(email));


--
-- Name: idx_credit_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions USING btree (user_id, created_at DESC);


--
-- Name: journal_entries_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_created_at_idx ON public.journal_entries USING btree (created_at DESC);


--
-- Name: journal_entries_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_user_id_idx ON public.journal_entries USING btree (user_id);


--
-- Name: reflection_usage_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reflection_usage_user_date ON public.reflection_usage USING btree (user_id, date);


--
-- Name: user_credits_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_credits_user_id_idx ON public.user_credits USING btree (user_id);


--
-- Name: user_credits protect_user_credits_entitlement_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER protect_user_credits_entitlement_fields BEFORE INSERT OR UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.protect_entitlement_fields();


--
-- Name: user_credits record_user_credits_plan_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER record_user_credits_plan_change AFTER UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.record_plan_change();


--
-- Name: user_plans set_timestamp_user_plans; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_user_plans BEFORE UPDATE ON public.user_plans FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: user_credits set_user_credits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: credit_transactions credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: plan_history plan_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_history
    ADD CONSTRAINT plan_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: upgrade_intents upgrade_intents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upgrade_intents
    ADD CONSTRAINT upgrade_intents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_credits user_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_plans user_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: credit_transactions Users can insert their own credit transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own credit transactions" ON public.credit_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_plans Users can insert their own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own plan" ON public.user_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_plans Users can update their own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own plan" ON public.user_plans FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: credit_transactions Users can view their own credit transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_plans Users can view their own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own plan" ON public.user_plans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_events analytics_events_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analytics_events_insert ON public.analytics_events FOR INSERT TO authenticated WITH CHECK (((user_id IS NULL) OR (auth.uid() = user_id)));


--
-- Name: analytics_events analytics_events_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analytics_events_select_own ON public.analytics_events FOR SELECT TO authenticated USING (((user_id IS NULL) OR (auth.uid() = user_id)));


--
-- Name: plan_history authenticated users can view own plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated users can view own plan history" ON public.plan_history FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries delete own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "delete own" ON public.journal_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: email_subscribe_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_subscribe_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: email_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries entries_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entries_delete_own ON public.journal_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journal_entries entries_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entries_insert_own ON public.journal_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journal_entries entries_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entries_select_own ON public.journal_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journal_entries entries_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entries_update_own ON public.journal_entries FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: journal_entries insert own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "insert own" ON public.journal_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journal_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries journal_entries_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY journal_entries_delete_own ON public.journal_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journal_entries journal_entries_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY journal_entries_insert_own ON public.journal_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journal_entries journal_entries_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY journal_entries_select_own ON public.journal_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journal_entries journal_entries_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY journal_entries_update_own ON public.journal_entries FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: plan_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: journal_entries read own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own" ON public.journal_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_credits read own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own credits" ON public.user_credits FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: reflection_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reflection_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: reflection_usage reflection_usage_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reflection_usage_insert_own ON public.reflection_usage FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: reflection_usage reflection_usage_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reflection_usage_select_own ON public.reflection_usage FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: journal_entries update own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "update own" ON public.journal_entries FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: upgrade_intents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upgrade_intents ENABLE ROW LEVEL SECURITY;

--
-- Name: user_plans user can insert own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user can insert own plan" ON public.user_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_plans user can read own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user can read own plan" ON public.user_plans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_plans user can update own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user can update own plan" ON public.user_plans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits user_credits_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_credits_insert_own ON public.user_credits FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_credits user_credits_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_credits_select_own ON public.user_credits FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_credits user_credits_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_credits_update_own ON public.user_credits FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict a43u2YvT8MPFUG8DaQqQGykS1fRoERXdiIafiZyAlbPS1dqh3fa2iMlPMo8k0OH

