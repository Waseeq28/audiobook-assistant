import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { BookDetailView } from '@/components/book-detail-view';
import { BookNotFound } from '@/components/book-not-found';
import { getAudiobookById } from '@/lib/librivox-api';
import { LibriVoxAudiobook } from '@/lib/types';

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<LibriVoxAudiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookData = await getAudiobookById(id);
        setBook(bookData);
      } catch (err) {
        setError('Failed to load book');
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6B7280" />
          <Text className="mt-4 text-base text-muted-foreground">Loading book...</Text>
        </View>
      </>
    );
  }

  if (error || !book) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not found' }} />
        <BookNotFound />
      </>
    );
  }

  return <BookDetailView book={book} />;
}
