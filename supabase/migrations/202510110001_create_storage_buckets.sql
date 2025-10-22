-- Create private buckets for source audio and derived clips
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('source-audio', 'source-audio', FALSE)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('audio-clips', 'audio-clips', FALSE)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Allow service role to manage source audio objects
CREATE POLICY "service role source audio"
ON storage.objects
FOR ALL
USING (bucket_id = 'source-audio' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'source-audio' AND auth.role() = 'service_role');

-- Allow service role to manage clip objects
CREATE POLICY "service role audio clips"
ON storage.objects
FOR ALL
USING (bucket_id = 'audio-clips' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'audio-clips' AND auth.role() = 'service_role');

