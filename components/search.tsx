import { useEffect, useState } from 'react';
import { FlatList, TextInput, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { SearchItem } from '@/components/search-item';
import { searchAudiobooksByTitle } from '@/lib/librivox-api';
import { LibriVoxAudiobook } from '@/lib/types';

export function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibriVoxAudiobook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // An async function to perform the actual search for a given query.
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchAudiobooksByTitle(query.trim());
        setResults(response.books || []);
      } catch (err) {
        setError('Search failed');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    // An async function to fetch the initial list of books.
    const fetchInitialList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchAudiobooksByTitle('', { limit: 20, offset: 0 });
        setResults(response.books || []);
      } catch (err) {
        setError('Failed to load initial audiobooks');
        console.error('Error loading initial audiobooks:', err);
      } finally {
        setLoading(false);
      }
    };

    // If the query is empty, fetch the initial list immediately.
    // This handles both the component's first load and when a user clears the search input.
    if (query.trim() === '') {
      fetchInitialList();
      // Exit the effect early; no need to set up a timer.
      return;
    }

    // If the query has text, set up a debouncer to perform the search.
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500);

    // Cleanup function: clear the timer if the component unmounts or the query changes.
    return () => clearTimeout(timeoutId);
  }, [query]); // The effect should only depend on the search query.

  return (
    <>
      <View className="px-6 pb-4">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title, author, or genre"
          className="mt-2 h-12 rounded-full border border-input bg-card px-5 text-base"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="grow px-6 pb-6"
        ListHeaderComponent={() => <View className="h-0.5" />}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <SearchItem
            id={item.id}
            title={item.title}
            authors={item.authors}
            genres={item.genres}
            totalTime={item.totaltime}
            coverUrl={item.coverart_thumbnail || item.coverart_jpg}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            {loading ? (
              <ActivityIndicator size="large" color="#6B7280" />
            ) : error ? (
              <Text className="text-base text-red-500">{error}</Text>
            ) : (
              <Text className="text-base text-muted-foreground">No matches found.</Text>
            )}
          </View>
        )}
      />
    </>
  );
}
