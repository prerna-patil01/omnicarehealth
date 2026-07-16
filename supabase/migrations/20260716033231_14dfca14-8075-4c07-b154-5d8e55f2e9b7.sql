
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE POLICY "own report files select" ON storage.objects FOR SELECT
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own report files insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own report files delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);
