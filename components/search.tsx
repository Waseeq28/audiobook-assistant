import { useMemo, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SearchItem } from '@/components/search-item';

interface SearchProps {
  searchFunction: (query: string) => any[];
}

export function Search({ searchFunction }: SearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchFunction(query), [query, searchFunction]);

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
            totalTime={item.totalTime}
            coverUrl={item.coverUrl}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-base text-muted-foreground">No matches found.</Text>
          </View>
        )}
      />
    </>
  );
}
