-- Create dm_threads table for direct messages between users
CREATE TABLE public.dm_threads (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dm_threads_users_check CHECK (user_a < user_b)
);

-- Index for faster lookups
CREATE UNIQUE INDEX dm_threads_users_idx ON public.dm_threads (user_a, user_b);

-- Enable RLS
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;

-- Policy: users can see threads they're part of
CREATE POLICY "dmt_select_participant" ON public.dm_threads
FOR SELECT USING (
  auth.uid() = user_a OR auth.uid() = user_b
);

-- Policy: users can create threads
CREATE POLICY "dmt_insert_participant" ON public.dm_threads
FOR INSERT WITH CHECK (
  (auth.uid() = user_a OR auth.uid() = user_b)
  AND user_a <> user_b
);

-- Create dm_messages table
CREATE TABLE public.dm_messages (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  thread_id bigint NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for faster queries
CREATE INDEX dm_messages_thread_id_idx ON public.dm_messages (thread_id, created_at);

-- Enable RLS
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

-- Policy: users can read messages from their threads
CREATE POLICY "dmm_select_participant" ON public.dm_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dm_threads
    WHERE id = dm_messages.thread_id
    AND (user_a = auth.uid() OR user_b = auth.uid())
  )
);

-- Policy: users can send messages to their threads
CREATE POLICY "dmm_insert_participant" ON public.dm_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.dm_threads
    WHERE id = dm_messages.thread_id
    AND (user_a = auth.uid() OR user_b = auth.uid())
  )
);

-- Create dm_reads table for tracking read messages
CREATE TABLE public.dm_reads (
  message_id bigint NOT NULL REFERENCES public.dm_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.dm_reads ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert their own reads
CREATE POLICY "dmr_insert_self" ON public.dm_reads
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: users can see their own reads
CREATE POLICY "dmr_select_self" ON public.dm_reads
FOR SELECT USING (user_id = auth.uid());

-- Create view for DM threads with enriched data
CREATE OR REPLACE VIEW public.v_dm_threads_for_user AS
SELECT 
  t.id AS thread_id,
  t.user_a,
  t.user_b,
  t.created_at AS thread_created_at,
  -- Determine "other user" based on who's logged in
  CASE 
    WHEN t.user_a = auth.uid() THEN t.user_b
    ELSE t.user_a
  END AS other_user_id,
  -- Get other user's profile data
  CASE 
    WHEN t.user_a = auth.uid() THEN pb.display_name
    ELSE pa.display_name
  END AS other_display_name,
  CASE 
    WHEN t.user_a = auth.uid() THEN pb.handle
    ELSE pa.handle
  END AS other_handle,
  CASE 
    WHEN t.user_a = auth.uid() THEN pb.avatar_url
    ELSE pa.avatar_url
  END AS other_avatar,
  -- Last message info
  lm.id AS last_message_id,
  lm.body AS last_message_body,
  lm.sender_id AS last_message_sender_id,
  lm.created_at AS last_message_at,
  -- Unread count for current user
  (
    SELECT COUNT(*)
    FROM public.dm_messages dm
    WHERE dm.thread_id = t.id
    AND dm.sender_id <> auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.dm_reads dr
      WHERE dr.message_id = dm.id
      AND dr.user_id = auth.uid()
    )
  ) AS unread_count_for_me
FROM public.dm_threads t
LEFT JOIN public.profiles pa ON t.user_a = pa.user_id
LEFT JOIN public.profiles pb ON t.user_b = pb.user_id
LEFT JOIN LATERAL (
  SELECT id, body, sender_id, created_at
  FROM public.dm_messages
  WHERE thread_id = t.id
  ORDER BY created_at DESC
  LIMIT 1
) lm ON true
WHERE t.user_a = auth.uid() OR t.user_b = auth.uid()
ORDER BY lm.created_at DESC NULLS LAST;