import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface TranscriptionDisplayProps {
  transcription: string | null;
  isTranscribing: boolean;
}

export function TranscriptionDisplay({ transcription, isTranscribing }: TranscriptionDisplayProps) {
  if (isTranscribing) {
    return (
      <View className="mt-4 rounded-lg bg-slate-100 p-4">
        <Text className="text-sm text-slate-600">Transcribing audio...</Text>
      </View>
    );
  }

  if (!transcription) {
    return null;
  }

  return (
    <View className="mt-4 rounded-lg bg-slate-100 p-4">
      <Text className="text-xs uppercase tracking-wide text-slate-500">Transcription</Text>
      <Text className="mt-2 text-sm text-slate-700">{transcription}</Text>
    </View>
  );
}
