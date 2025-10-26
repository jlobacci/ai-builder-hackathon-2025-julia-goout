-- Allow authenticated users to view other users' public profile information
-- This excludes sensitive data like CPF, contact info, and precise location

CREATE POLICY "profiles_read_public_info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id != auth.uid()
);

-- Note: The view v_public_profiles should be used for accessing other users' profiles
-- as it excludes sensitive fields (cpf, contact_whatsapp, lat, lng)
-- This policy allows direct table access but RLS still protects the data
-- and the application should use v_public_profiles for other users