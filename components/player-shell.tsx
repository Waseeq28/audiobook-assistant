import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { AIAssistantButton } from '@/components/ai-assistant-button';

interface PlayerShellProps {
  title: string;
  subtitle?: string;
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onAssistantPress: () => void;
  assistantDisabled?: boolean;
  assistantLabel?: string;
  currentTimeLabel: string;
  durationLabel: string;
  progressPercentage: number;
  onScrub?: (fraction: number) => void;
}

export function PlayerShell({
  title,
  subtitle,
  isLoaded,
  isPlaying,
  isBuffering,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  onAssistantPress,
  assistantDisabled,
  assistantLabel = 'Assist',
  currentTimeLabel,
  durationLabel,
  progressPercentage,
  onScrub,
}: PlayerShellProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage || 0));
  const [progressWidth, setProgressWidth] = useState(0);

  const handleScrub = useCallback(
    (event: any) => {
      if (!onScrub || !progressWidth) return;
      const locationX = event?.nativeEvent?.locationX ?? 0;
      const fraction = Math.min(1, Math.max(0, locationX / progressWidth));
      onScrub(fraction);
    },
    [onScrub, progressWidth]
  );

  return (
    <View className="mt-4 w-full rounded-2xl bg-white p-6 shadow-lg">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-semibold text-slate-900" numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-xs text-slate-500" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="items-end">
          <AIAssistantButton
            onPress={onAssistantPress}
            disabled={assistantDisabled}
            label={assistantLabel}
          />
          <Text className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Assistant</Text>
        </View>
      </View>

      <View className="mt-6 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onSeekBackward}
          disabled={!isLoaded}
          className="h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="play-back" size={20} color={!isLoaded ? '#CBD5E1' : '#334155'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          disabled={!isLoaded}
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-xl">
          {isBuffering ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSeekForward}
          disabled={!isLoaded}
          className="h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="play-forward" size={20} color={!isLoaded ? '#CBD5E1' : '#334155'} />
        </TouchableOpacity>
      </View>

      <View className="mt-6">
        <Pressable
          onPress={handleScrub}
          onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)}>
          <View className="h-1.5 w-full rounded-full bg-slate-200">
            <View
              className="h-1.5 rounded-full bg-blue-500"
              style={{ width: `${clampedProgress}%` }}
            />
          </View>
        </Pressable>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-xs font-medium text-slate-500">{currentTimeLabel}</Text>
          <Text className="text-xs font-medium text-slate-500">{durationLabel}</Text>
        </View>
      </View>
    </View>
  );
}
