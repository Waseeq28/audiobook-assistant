import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

export function BookNotFound() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-lg font-semibold">Audiobook not found</Text>
      <Text className="mt-2 text-sm text-muted-foreground">
        This is a mock dataset. Choose a title from the home screen.
      </Text>
    </SafeAreaView>
  );
}
