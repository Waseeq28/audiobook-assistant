import { useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { FlatList, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { MOCK_AUDIOBOOKS, type MockAudioSection } from '@/lib/mockData';

function SectionItem({ section }: { section: MockAudioSection }) {
  return (
    <View className="mb-3 rounded-xl border border-border bg-card p-4">
      <Text className="text-base font-medium" numberOfLines={2}>
        {section.title}
      </Text>
      <Text className="mt-2 text-sm text-muted-foreground">{section.duration}</Text>
      <Text className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        Preview unavailable in mock mode
      </Text>
    </View>
  );
}

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const book = useMemo(() => MOCK_AUDIOBOOKS.find((item) => item.id === id), [id]);

  if (!book) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-6">
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text className="text-lg font-semibold">Audiobook not found</Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          This is a mock dataset. Choose a title from the home screen.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: book.title, headerShown: false }} />
      <FlatList
        data={book.sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        ListHeaderComponent={() => (
          <View className="pb-6 pt-8">
            <View className="items-center">
              <Image
                source={{ uri: book.coverUrl }}
                className="h-48 w-32 rounded-xl bg-muted"
                resizeMode="cover"
              />
            </View>
            <Text className="mt-6 text-3xl font-bold" numberOfLines={3}>
              {book.title}
            </Text>
            <Text className="mt-2 text-base text-muted-foreground" numberOfLines={2}>
              {book.authors.join(', ')}
            </Text>
            <Text className="mt-3 text-sm text-muted-foreground">{book.genres.join(' · ')}</Text>
            <Text className="mt-3 text-sm text-muted-foreground">Total time: {book.totalTime}</Text>
            <Text className="mt-5 text-base leading-6 text-foreground/90">{book.description}</Text>
            <Text className="mt-6 text-lg font-semibold">Sections</Text>
          </View>
        )}
        renderItem={({ item }) => <SectionItem section={item} />}
      />
    </SafeAreaView>
  );
}
