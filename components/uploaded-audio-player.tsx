import { useCallback } from 'react';
import { PlayerShell } from '@/components/player-shell';
import { useAudioPlayerControls, useAIAssistant } from '@/hooks';
import { ClipTranscriptionPayload } from '@/lib/types';

interface UploadedAudioPlayerProps {
  file: {
    uri: string;
    name: string;
    storagePath: string;
    signedUrl?: string;
    mimeType?: string;
  };
  onPlaybackEnd?: (didJustFinish: boolean) => void;
  onAIAssistantPress?: (payload: ClipTranscriptionPayload) => void;
}

export function UploadedAudioPlayer({
  file,
  onPlaybackEnd,
  onAIAssistantPress,
}: UploadedAudioPlayerProps) {
  const {
    player,
    status,
    isLoaded,
    currentTime,
    duration,
    progressPercentage,
    isBuffering,
    handlePlayPause,
    seekBy,
    formatTime,
    handleScrub,
  } = useAudioPlayerControls(file.uri, onPlaybackEnd);

  const { prepareAssistant, assistantBusy, error } = useAIAssistant({
    source: { sourceType: 'uploaded', storagePath: file.storagePath },
    onSuccess: (payload) => onAIAssistantPress?.(payload),
  });

  if (error) {
    console.error('AI Assistant error:', error);
  }

  const handleAssistant = useCallback(async () => {
    if (!isLoaded || !status.currentTime) return;

    if (status.playing) {
      player.pause();
    }
    prepareAssistant(status.currentTime);
  }, [isLoaded, player, prepareAssistant, status.currentTime, status.playing]);

  const assistantSubtitle = file.mimeType ? file.mimeType : 'Uploaded audio';

  return (
    <PlayerShell
      title={file.name}
      subtitle={assistantSubtitle}
      isLoaded={isLoaded}
      isPlaying={status.playing}
      isBuffering={isBuffering}
      onPlayPause={handlePlayPause}
      onSeekBackward={() => seekBy(-15)}
      onSeekForward={() => seekBy(15)}
      onAssistantPress={handleAssistant}
      assistantDisabled={!isLoaded || assistantBusy}
      currentTimeLabel={formatTime(currentTime)}
      durationLabel={isLoaded && duration !== null ? formatTime(duration) : '0:00'}
      progressPercentage={progressPercentage}
      onScrub={handleScrub}
    />
  );
}
