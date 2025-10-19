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
import { Button } from '@/components/ui/button';
import { TranscriptionDisplay } from '@/components/transcription-display';

interface UploadedAudioPlayerProps {
  file: {
    uri: string;
    name: string;
    storagePath: string;
    signedUrl?: string;
    mimeType?: string;
  };
  onPlaybackEnd?: (didJustFinish: boolean) => void;
  onAIAssistantPress?: () => void;
}

export function UploadedAudioPlayer({
  file,
  onPlaybackEnd,
  onAIAssistantPress,
}: UploadedAudioPlayerProps) {
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [clipInfo, setClipInfo] = useState<{
    url: string;
    startSeconds: number;
    endSeconds: number;
  } | null>(null);
  const [isClipping, setIsClipping] = useState(false);
  const [clipError, setClipError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // --- Audio Player Setup ---
  const player = useAudioPlayer(file.uri);
  const status = useAudioPlayerStatus(player);
  const clipPreviewPlayer = useAudioPlayer(clipInfo?.url || '');
  const clipPreviewStatus = useAudioPlayerStatus(clipPreviewPlayer);

  // --- Effects for Callbacks ---
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

  const onProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

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
      {/* File Name */}
      <View className="mb-4">
        <Text className="text-center text-base font-bold text-slate-800" numberOfLines={2}>
          {file.name}
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">Uploaded Audio File</Text>
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
            {status.isLoaded && isFinite(status.duration) ? formatTime(status.duration) : '0:00'}
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
          onPress={async () => {
            if (!status.isLoaded) return;
            if (status.playing) {
              player.pause();
            }

            setIsClipping(true);
            setClipError(null);
            setTranscription(null);

            try {
              const payload = {
                sourceType: 'uploaded' as const,
                sourcePath: file.storagePath,
                timestampSeconds: status.currentTime ?? 0,
                windowSeconds: 5,
              };

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

              const data = (await response.json()) as {
                clip: { signedUrl: string; startSeconds: number; endSeconds: number };
              };

              setClipInfo({
                url: data.clip.signedUrl,
                startSeconds: data.clip.startSeconds,
                endSeconds: data.clip.endSeconds,
              });

              setIsTranscribing(true);
              try {
                const transcriptionResponse = await fetch(
                  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-audio`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clipUrl: data.clip.signedUrl }),
                  }
                );

                if (!transcriptionResponse.ok) {
                  const errorText = await transcriptionResponse.text();
                  throw new Error(errorText || 'Transcription request failed');
                }

                const transcriptionData = (await transcriptionResponse.json()) as { text?: string };
                setTranscription(transcriptionData.text ?? '');
              } catch (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                setClipError('Clip generated but transcription failed');
              } finally {
                setIsTranscribing(false);
              }
              onAIAssistantPress?.();
            } catch (error) {
              console.error('Clip request error:', error);
              setClipError('Failed to generate clip');
            } finally {
              setIsClipping(false);
            }
          }}
          disabled={!status.isLoaded || isClipping}
          isLoading={isClipping}
        />
        <Text className="mt-2 text-xs text-slate-500">Ask AI Assistant</Text>
      </View>

      {clipError && <Text className="mt-3 text-center text-xs text-red-500">{clipError}</Text>}

      {clipInfo && (
        <View className="mt-4 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4">
          <Text className="text-sm font-semibold text-blue-700">Clip Preview</Text>
          <Text className="mt-1 text-xs text-blue-600">
            Window: {Math.max(0, clipInfo.startSeconds).toFixed(1)}s →{' '}
            {clipInfo.endSeconds.toFixed(1)}s
          </Text>
          <Button
            onPress={() => {
              if (!clipInfo.url) return;
              if (clipPreviewStatus.playing) {
                clipPreviewPlayer.pause();
              } else {
                clipPreviewPlayer.play();
              }
            }}
            className="mt-3"
            disabled={!clipInfo.url || clipPreviewStatus.isBuffering}>
            <Text>{clipPreviewStatus.playing ? 'Pause Clip' : 'Play Clip'}</Text>
          </Button>
        </View>
      )}

      {clipInfo && (
        <TranscriptionDisplay transcription={transcription} isTranscribing={isTranscribing} />
      )}
    </View>
  );
}
