-- Remove the policy that still allows querying sensitive columns
DROP POLICY IF EXISTS "profiles_read_public_safe" ON public.profiles;

-- Now only profiles_read_own remains, which only allows users to see their own complete profile
-- This protects contact_whatsapp, cpf, lat, lng from unauthorized access

-- Create a view for public-safe profile data
DROP VIEW IF EXISTS public.v_public_profiles CASCADE;

CREATE VIEW public.v_public_profiles AS
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

-- Enable security invoker on the view (inherits RLS from profiles table)
ALTER VIEW public.v_public_profiles SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.v_public_profiles TO authenticated;
GRANT SELECT ON public.v_public_profiles TO anon;

COMMENT ON VIEW public.v_public_profiles IS 'Public-safe profile data without sensitive fields (contact_whatsapp, cpf, lat, lng). Use this view for displaying other users profiles. Only shows profiles the user has permission to see based on profiles table RLS.';