import { useCallback, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioPlayer } from 'expo-audio';

export function useAudioPlayerControls(
  audioUrl: string,
  onPlaybackEnd?: (didJustFinish: boolean) => void
) {
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);

  const isLoaded = status.isLoaded;
  const currentTime = typeof status.currentTime === 'number' ? status.currentTime : null;
  const duration = typeof status.duration === 'number' ? status.duration : null;
  const progressPercentage =
    isLoaded && duration && duration > 0 && currentTime !== null
      ? (currentTime / duration) * 100
      : 0;
  const isBuffering = !isLoaded || status.isBuffering;

  useEffect(() => {
    if (isLoaded && status.didJustFinish) {
      onPlaybackEnd?.(true);
    }
  }, [isLoaded, onPlaybackEnd, status.didJustFinish]);

  const handlePlayPause = useCallback(() => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish) {
      player.seekTo(0);
    }
    player.play();
  }, [player, status.didJustFinish, status.playing]);

  const seekBy = useCallback(
    (seconds: number) => {
      if (!isLoaded || typeof status.currentTime !== 'number') {
        return;
      }
      const next = Math.max(0, status.currentTime + seconds);
      player.seekTo(next);
    },
    [isLoaded, player, status.currentTime]
  );

  const formatTime = useCallback((seconds: number | null | undefined) => {
    if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) {
      return '0:00';
    }
    const wholeSeconds = Math.max(0, Math.floor(seconds));
    const m = Math.floor(wholeSeconds / 60);
    const s = (wholeSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const handleScrub = useCallback(
    (fraction: number) => {
      if (!isLoaded || duration === null) {
        return;
      }
      const target = Math.max(0, Math.min(duration, duration * fraction));
      player.seekTo(target);
    },
    [isLoaded, duration, player]
  );

  return {
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
  };
}
