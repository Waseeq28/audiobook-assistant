import { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function VoiceRecorder() {
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const player = useAudioPlayer(recordingUri || '');
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Permission to access microphone was denied');
        setPermissionGranted(false);
      } else {
        setPermissionGranted(true);
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        setRecordingUri(uri);
        console.log('Recording saved at:', uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = () => {
    if (!recordingUri) {
      Alert.alert('No Recording', 'Please record audio first');
      return;
    }

    if (playerStatus.playing) {
      player.pause();
    } else {
      if (playerStatus.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  if (!permissionGranted) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-muted-foreground">
          Microphone permission is required to test voice recording.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6">
      <View className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
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
            <Button onPress={startRecording} className="w-full bg-red-600 active:bg-red-700">
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
      </View>
    </View>
  );
}
