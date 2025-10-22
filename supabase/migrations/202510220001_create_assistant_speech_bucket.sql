DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('assistant-speech', 'assistant-speech', FALSE)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE POLICY "service role assistant speech"
ON storage.objects
FOR ALL
USING (bucket_id = 'assistant-speech' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'assistant-speech' AND auth.role() = 'service_role');

