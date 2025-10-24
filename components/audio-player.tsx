import { useCallback } from 'react';
import { LibriVoxSection } from '@/lib/types';
import { ClipTranscriptionPayload } from '@/lib/types';
import { PlayerShell } from '@/components/player-shell';
import { useAudioPlayerControls, useAIAssistant } from '@/hooks';

// --- Component Props ---
interface AudioPlayerProps {
  section: LibriVoxSection;
  onPlaybackEnd?: (didJustFinish: boolean) => void;
  onAIAssistantPress?: (payload: ClipTranscriptionPayload) => void;
}

export function AudioPlayer({ section, onPlaybackEnd, onAIAssistantPress }: AudioPlayerProps) {
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
  } = useAudioPlayerControls(section.listen_url, onPlaybackEnd);

  const { prepareAssistant, assistantBusy, error } = useAIAssistant({
    source: { sourceType: 'remote', listenUrl: section.listen_url },
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

  const assistantSubtitle = section.readers?.length
    ? `Read by ${section.readers.map((reader) => reader.display_name).join(', ')}`
    : undefined;

  return (
    <PlayerShell
      title={section.title}
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
      durationLabel={
        isLoaded && duration !== null ? formatTime(duration) : section.playtime || '0:00'
      }
      progressPercentage={progressPercentage}
      onScrub={handleScrub}
    />
  );
}
