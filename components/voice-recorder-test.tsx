import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TranscriptionDisplay } from '@/components/transcription-display';
import { useTranscription, useVoiceRecorder } from '@/hooks';

interface VoiceRecorderProps {
  onTranscriptionChange?: (transcription: string | null) => void;
}

export function VoiceRecorder({ onTranscriptionChange }: VoiceRecorderProps) {
  const [transcription, setTranscription] = useState<string | null>(null);

  const {
    permissionGranted,
    recordingUri,
    recorderState,
    playerStatus,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
  } = useVoiceRecorder();

  const { transcribeFile, loading: isTranscribing, error: transcriptionError } = useTranscription();

  const handleStartRecording = () => {
    setTranscription(null);
    onTranscriptionChange?.(null);
    clearRecording();
    startRecording();
  };

  const transcribeRecording = async () => {
    if (!recordingUri || recorderState.isRecording) {
      return;
    }

    try {
      const transcriptText = await transcribeFile({
        uri: recordingUri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      });
      setTranscription(transcriptText);
      onTranscriptionChange?.(transcriptText);
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe recording');
      onTranscriptionChange?.(null);
    }
  };

  if (transcriptionError) {
    console.error('Transcription hook error:', transcriptionError);
  }

  if (!permissionGranted) {
    return (
      <View className="items-center justify-center px-6 py-16">
        <Text className="text-center text-base text-muted-foreground">
          Microphone permission is required to test voice recording.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-6 pb-12">
      <View className="rounded-2xl bg-white p-6 shadow-lg">
        <Text className="mb-4 text-center text-xl font-bold text-slate-800">Voice Recording</Text>

        <View className="mb-4 rounded-lg bg-slate-100 p-4">
          <Text className="text-center text-sm text-slate-600">
            Status: {recorderState.isRecording ? 'Recording...' : 'Ready'}
          </Text>
          {recorderState.isRecording && recorderState.durationMillis && (
            <Text className="mt-1 text-center text-xs text-slate-500">
              Duration: {Math.floor(recorderState.durationMillis / 1000)}s
            </Text>
          )}
          {recordingUri && !recorderState.isRecording && (
            <Text className="mt-1 text-center text-xs text-green-600">Recording saved</Text>
          )}
        </View>

        <View className="space-y-3">
          {!recorderState.isRecording ? (
            <Button onPress={handleStartRecording} className="w-full bg-red-600 active:bg-red-700">
              <Text className="text-base font-semibold text-white">Start Recording</Text>
            </Button>
          ) : (
            <Button onPress={stopRecording} className="w-full bg-slate-600 active:bg-slate-700">
              <Text className="text-base font-semibold text-white">Stop Recording</Text>
            </Button>
          )}

          <View className="h-4" />

          <Button
            onPress={playRecording}
            disabled={!recordingUri || recorderState.isRecording}
            className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-400">
            <Text className="text-base font-semibold text-white">
              {playerStatus.playing ? 'Pause Playback' : 'Play Recording'}
            </Text>
          </Button>

          <View className="h-4" />

          <Button
            onPress={transcribeRecording}
            disabled={!recordingUri || recorderState.isRecording || isTranscribing}
            className="w-full bg-emerald-600 active:bg-emerald-700 disabled:bg-gray-400">
            <Text className="text-base font-semibold text-white">
              {isTranscribing ? 'Transcribing...' : 'Transcribe Recording'}
            </Text>
          </Button>
        </View>

        {playerStatus.isLoaded && recordingUri && (
          <View className="mt-4 rounded-lg bg-blue-50 p-3">
            <Text className="text-center text-xs text-blue-600">
              Playback: {playerStatus.playing ? 'Playing' : 'Paused'}
            </Text>
            {playerStatus.duration && (
              <Text className="mt-1 text-center text-xs text-blue-500">
                {Math.floor(playerStatus.currentTime)}s / {Math.floor(playerStatus.duration)}s
              </Text>
            )}
          </View>
        )}

        <TranscriptionDisplay transcription={transcription} isTranscribing={isTranscribing} />
      </View>
    </View>
  );
}
