-- Newsletter and function security hardening
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
