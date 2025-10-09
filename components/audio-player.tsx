import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { AIAssistantButton } from '@/components/ai-assistant-button';
import { LibriVoxSection } from '@/lib/types';

// --- Component Props ---
interface AudioPlayerProps {
  section: LibriVoxSection;
  onPlaybackEnd?: (didJustFinish: boolean) => void;
  onAIAssistantPress?: () => void;
}

export function AudioPlayer({ section, onPlaybackEnd, onAIAssistantPress }: AudioPlayerProps) {
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // --- Audio Player Setup ---
  const player = useAudioPlayer(section.listen_url);
  const status = useAudioPlayerStatus(player);

  // --- Effects for Callbacks ---
  // Effect to notify parent component when playback finishes
  useEffect(() => {
    if (status.isLoaded && status.didJustFinish) {
      onPlaybackEnd?.(true);
    }
  }, [status.isLoaded, status.didJustFinish, onPlaybackEnd]);

  // --- Memoized Control Functions ---
  const handlePlayPause = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish) {
        // If the track finished, seek to the beginning before playing again.
        player.seekTo(0);
      }
      player.play();
    }
  }, [player, status.playing, status.didJustFinish]);

  const seekBy = useCallback(
    (seconds: number) => {
      if (status.isLoaded && typeof status.currentTime === 'number') {
        const newTime = Math.max(0, status.currentTime + seconds);
        player.seekTo(newTime);
      }
    },
    [player, status.isLoaded, status.currentTime]
  );

  const handleSeekToPosition = useCallback(
    (event: any) => {
      // Add robust guards to prevent seeking with invalid values
      if (
        !status.isLoaded ||
        typeof status.duration !== 'number' ||
        !isFinite(status.duration) ||
        status.duration <= 0 ||
        progressBarWidth === 0
      ) {
        return;
      }

      const tapPosition = event.nativeEvent.locationX;
      const percentage = tapPosition / progressBarWidth;
      const newTime = percentage * status.duration;

      if (isFinite(newTime)) {
        player.seekTo(newTime);
      }
    },
    [player, status.isLoaded, status.duration, progressBarWidth]
  );

  // --- Helper to measure the progress bar for responsive seeking ---
  const onProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  // --- UI Helpers ---
  const formatTime = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isPlayerLoading = !status.isLoaded || status.isBuffering;
  const progressPercentage =
    status.isLoaded && status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <View className="mt-4 w-full rounded-2xl bg-white p-4 shadow-lg">
      {/* Section Title and Reader */}
      <View className="mb-4">
        <Text className="text-center text-base font-bold text-slate-800" numberOfLines={2}>
          {section.title}
        </Text>
        {section.readers && section.readers.length > 0 && (
          <Text className="mt-1 text-center text-sm text-slate-500">
            Read by: {section.readers.map((r) => r.display_name).join(', ')}
          </Text>
        )}
      </View>

      {/* Progress Bar and Time */}
      <View className="mb-2">
        <Pressable onPress={handleSeekToPosition} onLayout={onProgressBarLayout}>
          <View className="h-2 w-full rounded-full bg-slate-200">
            <View
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </Pressable>
        <View className="mt-2 flex-row justify-end">
          <Text className="text-xs text-slate-500">
            {status.isLoaded ? formatTime(status.currentTime) : '0:00'} /{' '}
            {status.isLoaded && isFinite(status.duration)
              ? formatTime(status.duration)
              : section.playtime || '0:00'}
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View className="flex-row items-center justify-center space-x-4">
        <TouchableOpacity onPress={() => seekBy(-15)} disabled={!status.isLoaded} className="p-2">
          <Ionicons name="play-back" size={24} color={!status.isLoaded ? '#CBD5E1' : '#334155'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={!status.isLoaded}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-md">
          {isPlayerLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name={status.playing ? 'pause' : 'play'} size={32} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => seekBy(15)} disabled={!status.isLoaded} className="p-2">
          <Ionicons
            name="play-forward"
            size={24}
            color={!status.isLoaded ? '#CBD5E1' : '#334155'}
          />
        </TouchableOpacity>
      </View>

      {/* AI Assistant Button */}
      <View className="mt-4 items-center">
        <AIAssistantButton
          onPress={() => {
            // Pause playback when AI assistant is activated
            if (status.playing) {
              player.pause();
            }
            onAIAssistantPress?.();
          }}
          disabled={!status.isLoaded}
        />
        <Text className="mt-2 text-xs text-slate-500">Ask AI Assistant</Text>
      </View>
    </View>
  );
}
