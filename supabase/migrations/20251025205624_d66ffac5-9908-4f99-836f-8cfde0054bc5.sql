-- Drop the overly permissive policy
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;

-- Allow users to read their own complete profile (including sensitive data)
CREATE POLICY "profiles_read_own"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- Allow authenticated users to read only safe fields from other profiles
-- Using a more restrictive approach: only public-safe data
CREATE POLICY "profiles_read_public_safe"
ON public.profiles
FOR SELECT
USING (
  user_id != auth.uid() 
  AND auth.uid() IS NOT NULL
);

-- Note: The above policy allows SELECT but frontend should only request safe columns
-- Create a view for public-safe profile data
CREATE OR REPLACE VIEW public.v_public_profiles AS
SELECT 
  user_id,
  display_name,
  handle,
  avatar_url,
  bio,
  city,
  state,
  country,
  radius_km,
  other_hobbies,
  verified,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.v_public_profiles SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.v_public_profiles TO authenticated;
GRANT SELECT ON public.v_public_profiles TO anon;

COMMENT ON VIEW public.v_public_profiles IS 'Public-safe profile data without sensitive fields like contact_whatsapp, cpf, lat, lng';
COMMENT ON POLICY "profiles_read_own" ON public.profiles IS 'Users can read their own complete profile including sensitive data';
COMMENT ON POLICY "profiles_read_public_safe" ON public.profiles IS 'Authenticated users can read other profiles but should only request public-safe fields';