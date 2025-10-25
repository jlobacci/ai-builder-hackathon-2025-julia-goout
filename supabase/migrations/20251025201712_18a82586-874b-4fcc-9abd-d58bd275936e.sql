-- Allow users to delete their own hobbies
CREATE POLICY "uh_delete_own" 
ON public.user_hobbies 
FOR DELETE 
USING (user_id = auth.uid());