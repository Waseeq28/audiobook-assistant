import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-3xl font-bold text-primary">
          {Constants.expoConfig?.name ?? '{{APP_NAME}}'}
        </Text>
        <Text className="mb-6 text-center text-lg text-muted-foreground">
          Welcome to your new mobile app!
        </Text>
        <Text className="mb-6 rounded-2xl bg-secondary p-4 text-center text-base text-secondary-foreground">
          Built with Expo + Supabase + NativeWind + Shadcn/UI
        </Text>
        <Button variant="default" size="lg">
          <Text className="text-xl">Get Started</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
