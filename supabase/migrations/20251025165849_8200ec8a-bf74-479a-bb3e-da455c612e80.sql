-- Criar políticas RLS para o bucket media-avatars

-- Policy para INSERT (upload)
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'media-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy para SELECT (visualizar)
CREATE POLICY "avatars_select_all" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'media-avatars');

-- Policy para UPDATE (atualizar)
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'media-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'media-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy para DELETE (deletar)
CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'media-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );