-- Add custom_hobby column to invites table
ALTER TABLE public.invites
ADD COLUMN custom_hobby text;

COMMENT ON COLUMN public.invites.custom_hobby IS 'Custom hobby name when user wants to specify a hobby not in the hobbies list';