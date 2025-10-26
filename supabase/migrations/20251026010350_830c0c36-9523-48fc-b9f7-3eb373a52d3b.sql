-- Add DELETE policy for invites table
-- Allow users to delete their own invites
CREATE POLICY "inv_delete_own" ON public.invites
  FOR DELETE
  USING (author_id = auth.uid());