import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

export function useVoiceRecorder() {
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const player = useAudioPlayer(recordingUri || '');
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionGranted(status.granted);
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Permission to access microphone was denied');
      } else {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    })();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  }, [audioRecorder]);

  const stopRecording = useCallback(async () => {
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
  }, [audioRecorder]);

  const playRecording = useCallback(() => {
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
  }, [player, playerStatus, recordingUri]);

  return {
    permissionGranted,
    recordingUri,
    recorderState,
    playerStatus,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording: () => setRecordingUri(null),
  };
}
