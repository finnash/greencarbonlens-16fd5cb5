CREATE POLICY "no client access" ON public.rate_limits FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
GRANT ALL ON public.rate_limits TO service_role;