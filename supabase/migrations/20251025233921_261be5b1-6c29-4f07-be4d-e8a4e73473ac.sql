-- Add server-side input validation constraints
-- This prevents malformed or malicious data from being stored

-- Profiles table constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT display_name_length CHECK (char_length(display_name) BETWEEN 2 AND 100),
  ADD CONSTRAINT handle_length CHECK (char_length(handle) BETWEEN 3 AND 30),
  ADD CONSTRAINT handle_format CHECK (handle ~ '^\S+$'),
  ADD CONSTRAINT bio_length CHECK (bio IS NULL OR char_length(bio) <= 500),
  ADD CONSTRAINT cpf_format CHECK (cpf IS NULL OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
  ADD CONSTRAINT other_hobbies_length CHECK (other_hobbies IS NULL OR char_length(other_hobbies) <= 500);

-- Posts table constraints
ALTER TABLE public.posts
  ADD CONSTRAINT post_body_length CHECK (body IS NULL OR char_length(body) <= 5000);

-- Post comments table constraints
ALTER TABLE public.post_comments
  ADD CONSTRAINT comment_body_length CHECK (char_length(body) <= 2000);

-- Messages table constraints
ALTER TABLE public.messages
  ADD CONSTRAINT message_body_length CHECK (char_length(body) <= 5000);

-- DM messages table constraints
ALTER TABLE public.dm_messages
  ADD CONSTRAINT dm_body_length CHECK (char_length(body) <= 5000);

-- Invites table constraints
ALTER TABLE public.invites
  ADD CONSTRAINT invite_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
  ADD CONSTRAINT invite_description_length CHECK (description IS NULL OR char_length(description) <= 2000),
  ADD CONSTRAINT invite_materials_length CHECK (materials IS NULL OR char_length(materials) <= 1000),
  ADD CONSTRAINT invite_city_length CHECK (city IS NULL OR char_length(city) <= 100),
  ADD CONSTRAINT invite_custom_hobby_length CHECK (custom_hobby IS NULL OR char_length(custom_hobby) <= 100);

-- Reviews table constraints
ALTER TABLE public.reviews
  ADD CONSTRAINT review_body_length CHECK (body IS NULL OR char_length(body) <= 1000),
  ADD CONSTRAINT review_stars_range CHECK (stars BETWEEN 1 AND 5);

-- Applications table constraints
ALTER TABLE public.applications
  ADD CONSTRAINT application_message_length CHECK (message IS NULL OR char_length(message) <= 1000);

-- CPF validation function (validates Brazilian CPF checksum)
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cpf_numbers TEXT;
  digit1 INTEGER;
  digit2 INTEGER;
  sum1 INTEGER := 0;
  sum2 INTEGER := 0;
  i INTEGER;
BEGIN
  -- Return true if NULL (optional field)
  IF cpf_input IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Remove formatting
  cpf_numbers := regexp_replace(cpf_input, '[^0-9]', '', 'g');
  
  -- Check length
  IF length(cpf_numbers) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for known invalid CPFs (all same digit)
  IF cpf_numbers IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                      '44444444444', '55555555555', '66666666666', '77777777777',
                      '88888888888', '99999999999') THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate first check digit
  FOR i IN 1..9 LOOP
    sum1 := sum1 + (substring(cpf_numbers, i, 1)::INTEGER * (11 - i));
  END LOOP;
  digit1 := 11 - (sum1 % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calculate second check digit
  FOR i IN 1..10 LOOP
    sum2 := sum2 + (substring(cpf_numbers, i, 1)::INTEGER * (12 - i));
  END LOOP;
  digit2 := 11 - (sum2 % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verify check digits
  RETURN (substring(cpf_numbers, 10, 1)::INTEGER = digit1 AND 
          substring(cpf_numbers, 11, 1)::INTEGER = digit2);
END;
$$;

-- Add CPF validation constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT cpf_valid CHECK (validate_cpf(cpf));

-- Make media-posts bucket private (keep avatars public for UX)
UPDATE storage.buckets SET public = false WHERE id = 'media-posts';

-- Add helpful comments
COMMENT ON FUNCTION public.validate_cpf IS 'Validates Brazilian CPF using official checksum algorithm';
COMMENT ON CONSTRAINT cpf_valid ON public.profiles IS 'Ensures CPF follows valid Brazilian CPF format and checksum';
COMMENT ON CONSTRAINT display_name_length ON public.profiles IS 'Prevents excessively long display names (2-100 chars)';
COMMENT ON CONSTRAINT handle_length ON public.profiles IS 'Prevents excessively long handles (3-30 chars)';
COMMENT ON CONSTRAINT handle_format ON public.profiles IS 'Ensures handles have no spaces';
COMMENT ON CONSTRAINT bio_length ON public.profiles IS 'Prevents abuse via extremely long bios (max 500 chars)';
COMMENT ON CONSTRAINT post_body_length ON public.posts IS 'Prevents abuse via extremely long posts (max 5000 chars)';
COMMENT ON CONSTRAINT comment_body_length ON public.post_comments IS 'Prevents abuse via extremely long comments (max 2000 chars)';
COMMENT ON CONSTRAINT review_stars_range ON public.reviews IS 'Ensures review ratings are between 1 and 5 stars';