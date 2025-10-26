-- Fix profiles RLS bypass risk
-- Drop the insecure policy that allows reading full profile rows
DROP POLICY IF EXISTS profiles_read_others ON public.profiles;

-- Create secure function to get public profile data only
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  bio text,
  city text,
  state text,
  country text,
  verified boolean,
  created_at timestamptz,
  radius_km integer,
  other_hobbies text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    user_id,
    display_name,
    handle,
    avatar_url,
    bio,
    city,
    state,
    country,
    verified,
    created_at,
    radius_km,
    other_hobbies
  FROM profiles
  WHERE user_id = target_user_id;
$$;