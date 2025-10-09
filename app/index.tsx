import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Text } from '@/components/ui/text';
import { Search } from '@/components/search';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-wide text-muted-foreground">Prototype</Text>
          <Text className="text-2xl font-bold">
            {Constants.expoConfig?.name ?? 'Audiobook Assistant'}
          </Text>
        </View>
      </View>

      <Search />
    </SafeAreaView>
  );
}
