import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { BookHeader } from '@/components/book-header';
import { SectionItem } from '@/components/section-item';
import { type MockAudiobook } from '@/lib/mockData';

interface BookDetailViewProps {
  book: MockAudiobook;
}

export function BookDetailView({ book }: BookDetailViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: book.title, headerShown: false }} />
      <FlatList
        data={book.sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        ListHeaderComponent={() => (
          <BookHeader
            title={book.title}
            authors={book.authors}
            genres={book.genres}
            totalTime={book.totalTime}
            description={book.description}
            coverUrl={book.coverUrl}
          />
        )}
        renderItem={({ item }) => <SectionItem section={item} />}
      />
    </SafeAreaView>
  );
}
