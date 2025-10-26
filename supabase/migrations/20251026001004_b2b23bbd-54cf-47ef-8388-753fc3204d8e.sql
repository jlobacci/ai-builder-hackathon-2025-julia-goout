-- Adicionar política para permitir leitura de perfis de outros usuários
-- A view v_public_profiles já filtra campos sensíveis (cpf, contact_whatsapp, lat, lng)
CREATE POLICY "profiles_read_others"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id != auth.uid() 
  AND auth.uid() IS NOT NULL
);

COMMENT ON POLICY "profiles_read_others" ON public.profiles IS 
  'Allows authenticated users to read other users profiles. Sensitive fields (cpf, contact_whatsapp, lat, lng) should be accessed through v_public_profiles view only.';