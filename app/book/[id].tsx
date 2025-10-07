import { useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { BookDetailView } from '@/components/book-detail-view';
import { BookNotFound } from '@/components/book-not-found';
import { MOCK_AUDIOBOOKS } from '@/lib/mockData';

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const book = useMemo(() => MOCK_AUDIOBOOKS.find((item) => item.id === id), [id]);

  if (!book) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not found' }} />
        <BookNotFound />
      </>
    );
  }

  return <BookDetailView book={book} />;
}
