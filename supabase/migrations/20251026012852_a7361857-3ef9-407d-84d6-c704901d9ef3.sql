-- Create table for user notification state (last seen timestamp)
CREATE TABLE IF NOT EXISTS public.user_notification_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notification_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "uns_select_own" ON public.user_notification_state
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "uns_insert_own" ON public.user_notification_state
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "uns_update_own" ON public.user_notification_state
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add RLS policy for applications UPDATE (to accept/reject requests)
CREATE POLICY "apps_update_organizer" ON public.applications
  FOR UPDATE
  USING (
    invite_id IN (
      SELECT id FROM invites WHERE author_id = auth.uid()
    )
  )
  WITH CHECK (
    invite_id IN (
      SELECT id FROM invites WHERE author_id = auth.uid()
    )
  );