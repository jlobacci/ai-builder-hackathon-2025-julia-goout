-- Policy: Users can upload their own posts images
CREATE POLICY "Users can upload own posts images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view posts images (public bucket)
CREATE POLICY "Anyone can view posts images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-posts');

-- Policy: Users can update their own posts images
CREATE POLICY "Users can update own posts images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own posts images
CREATE POLICY "Users can delete own posts images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);