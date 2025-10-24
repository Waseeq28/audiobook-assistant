import { useCallback, useState } from 'react';

type SpeechRequest = {
  text: string;
  voice?: string;
};

type SpeechResponse = {
  signedUrl?: string;
};

export function useAssistantSpeech() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthesize = useCallback(async ({ text, voice = 'alloy' }: SpeechRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/assistant-tts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, voice }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'TTS request failed');
      }

      const data = (await response.json()) as SpeechResponse;
      if (!data.signedUrl) {
        throw new Error('Missing speech URL');
      }

      return data.signedUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { synthesize, loading, error };
}
