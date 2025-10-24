import { useCallback, useState } from 'react';

type AssistantClipPayload = {
  url: string;
  transcript: string;
  startSeconds: number;
  endSeconds: number;
  source: string;
};

type AssistantRequest = {
  clip: AssistantClipPayload;
  userRecording: {
    transcript: string;
  };
};

type AssistantResponse = {
  message?: string;
};

export function useAssistantStream() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToAssistant = useCallback(async (payload: AssistantRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/assistant-stream`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Assistant request failed');
      }

      const data = (await response.json()) as AssistantResponse;
      return data.message ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assistant request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendToAssistant, loading, error };
}
