-- Enable realtime for post_likes table
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;

-- Enable realtime for post_comments table  
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;

-- Note: The tables should already be in the supabase_realtime publication,
-- but we'll ensure they are added if not present
DO $$
BEGIN
  -- Add post_likes to realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'post_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
  END IF;

  -- Add post_comments to realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'post_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
  END IF;
END $$;