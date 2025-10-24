import { useCallback, useState } from 'react';

type UploadArgs = {
  uri: string;
  name: string;
  type?: string;
};

type UploadResult = {
  path: string;
  signedUrl?: string;
  mimeType?: string;
};

export function useAudioUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async ({ uri, name, type }: UploadArgs) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name,
        type: type || 'audio/m4a',
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/upload-audio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const result = (await response.json()) as UploadResult;
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, loading, error };
}
