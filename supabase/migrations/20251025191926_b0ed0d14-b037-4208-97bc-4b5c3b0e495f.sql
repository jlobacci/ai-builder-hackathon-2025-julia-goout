-- Políticas RLS para bucket media-avatars
-- Permitir que usuários autenticados façam upload de seus próprios avatares

-- Permitir INSERT (upload) de arquivos
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir UPDATE de arquivos próprios
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'media-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir DELETE de arquivos próprios
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública de avatares
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media-avatars');