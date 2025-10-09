import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { BookHeader } from '@/components/book-header';
import { SectionItem } from '@/components/section-item';
import { type LibriVoxAudiobook } from '@/lib/types';

interface BookDetailViewProps {
  book: LibriVoxAudiobook;
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
            totalTime={book.totaltime}
            description={book.description}
            coverUrl={book.coverart_thumbnail || book.coverart_jpg}
          />
        )}
        renderItem={({ item }) => <SectionItem section={item} />}
      />
    </SafeAreaView>
  );
}
