import { useCallback, useState } from 'react';

type ClipRequest =
  | {
      sourceType: 'remote';
      sourceUrl: string;
      timestampSeconds: number;
      windowSeconds: number;
    }
  | {
      sourceType: 'uploaded';
      sourcePath: string;
      timestampSeconds: number;
      windowSeconds: number;
    };

type ClipResponse = {
  clip: {
    signedUrl: string;
    startSeconds: number;
    endSeconds: number;
  };
};

export function useAudioClipper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clip = useCallback(async (payload: ClipRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_CLIPPER_URL}/api/clip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Clip request failed');
      }

      const data = (await response.json()) as ClipResponse;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clip request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { clip, loading, error };
}
