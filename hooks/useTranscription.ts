import { useCallback, useState } from 'react';

type TranscriptionResponse = {
  text?: string;
};

type FileTranscriptionArgs = {
  uri: string;
  name: string;
  type?: string;
};

export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (body: BodyInit, headers: HeadersInit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers,
          body,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Transcription failed');
      }

      const result = (await response.json()) as TranscriptionResponse;
      return result.text ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const transcribeFile = useCallback(
    async ({ uri, name, type }: FileTranscriptionArgs) => {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name,
        type: type || 'audio/m4a',
      } as any);

      return request(formData, {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      });
    },
    [request]
  );

  const transcribeClipUrl = useCallback(
    async (clipUrl: string) => {
      return request(JSON.stringify({ clipUrl }), {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      });
    },
    [request]
  );

  return { transcribeFile, transcribeClipUrl, loading, error };
}
