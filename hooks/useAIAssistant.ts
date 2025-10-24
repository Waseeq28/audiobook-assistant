import { useCallback } from 'react';
import { useAudioClipper } from './useAudioClipper';
import { useTranscription } from './useTranscription';
import { ClipTranscriptionPayload } from '@/lib/types';

type AssistantSource =
  | { sourceType: 'remote'; listenUrl: string }
  | { sourceType: 'uploaded'; storagePath: string };

type UseAIAssistantArgs = {
  source: AssistantSource;
  onSuccess: (payload: ClipTranscriptionPayload) => void;
};

export function useAIAssistant({ source, onSuccess }: UseAIAssistantArgs) {
  const { clip, loading: clipLoading, error: clipError } = useAudioClipper();
  const {
    transcribeClipUrl,
    loading: transcriptionLoading,
    error: transcriptionError,
  } = useTranscription();

  const assistantBusy = clipLoading || transcriptionLoading;

  const prepareAssistant = useCallback(
    async (currentTime: number) => {
      try {
        const clipResult = await clip(
          source.sourceType === 'remote'
            ? {
                sourceType: 'remote',
                sourceUrl: source.listenUrl,
                timestampSeconds: currentTime,
                windowSeconds: 5,
              }
            : {
                sourceType: 'uploaded',
                sourcePath: source.storagePath,
                timestampSeconds: currentTime,
                windowSeconds: 5,
              }
        );

        const { signedUrl, startSeconds, endSeconds } = clipResult.clip;
        let transcript: string | null = null;

        try {
          transcript = await transcribeClipUrl(signedUrl);
        } catch (error) {
          console.error('Clip transcription failed:', error);
          transcript = null;
        }

        onSuccess({
          clipUrl: signedUrl,
          transcription: transcript,
          startSeconds,
          endSeconds,
          sourceType: source.sourceType,
        });
      } catch (error) {
        console.error('Assistant preparation failed:', error);
      }
    },
    [clip, transcribeClipUrl, onSuccess, source]
  );

  return {
    prepareAssistant,
    assistantBusy,
    error: clipError || transcriptionError,
  };
}
