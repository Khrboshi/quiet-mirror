-- Quiet Mirror: security hardening and entitlement states
-- Applied to production 2026-08-22.

DROP POLICY IF EXISTS "Service role full access" ON public.email_subscribers;
REVOKE ALL ON TABLE public.email_subscribers FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_subscribe_attempts FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_credits() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_free_credit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decrement_user_credit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.consume_reflection_credit(integer) FROM PUBLIC, anon;

ALTER FUNCTION public.set_current_timestamp_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.decrement_user_credit(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.consume_free_credit(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user_credits() SET search_path = public, pg_temp;
ALTER FUNCTION public.consume_reflection_credit(integer) SET search_path = public, pg_temp;

ALTER TABLE public.user_credits DROP CONSTRAINT IF EXISTS user_credits_plan_type_check;
ALTER TABLE public.user_credits ADD CONSTRAINT user_credits_plan_type_check CHECK (plan_type IN ('FREE','TRIAL','PREMIUM','EARLY_ACCESS'));
ALTER TABLE public.user_plans DROP CONSTRAINT IF EXISTS user_plans_plan_type_check;
ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_plan_type_check CHECK (plan_type IN ('FREE','TRIAL','PREMIUM','EARLY_ACCESS'));
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_tier_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_tier_check CHECK (tier IN ('free','paid','early_access'));

CREATE OR REPLACE FUNCTION public.consume_reflection_credit(p_amount integer DEFAULT 1)
RETURNS TABLE(remaining_credits integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
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