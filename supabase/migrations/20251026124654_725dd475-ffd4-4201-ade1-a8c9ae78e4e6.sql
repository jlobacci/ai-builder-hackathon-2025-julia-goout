-- Fix NULLABLE user ID columns (critical security issue)
-- These columns are used in RLS policies and must not be NULL

-- Fix applications.applicant_id
ALTER TABLE public.applications 
ALTER COLUMN applicant_id SET NOT NULL;

-- Fix invites.author_id
ALTER TABLE public.invites 
ALTER COLUMN author_id SET NOT NULL;

-- Fix messages.sender_id
ALTER TABLE public.messages 
ALTER COLUMN sender_id SET NOT NULL;

-- Make media-posts bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'media-posts';

-- Add public read policy for media-posts
CREATE POLICY "media_posts_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-posts');