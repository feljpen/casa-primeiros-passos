-- Trigger-only function: no one needs direct EXECUTE
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_authorized_email() FROM PUBLIC, anon, authenticated;

-- Role check: only signed-in users need it; block anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;