import { useMemo, useState } from 'react';
import { FlatList, Image, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { searchAudiobooks } from '@/lib/mockData';

export default function Home() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchAudiobooks(query), [query]);

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
          <Link href={`/book/${item.id}`} asChild>
            <TouchableOpacity className="flex-row rounded-3xl bg-slate-900/5 px-5 py-4">
              <Image
                source={{ uri: item.coverUrl }}
                className="mr-4 h-24 w-16 rounded-xl bg-slate-200/80"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
                  {item.authors.join(', ')}
                </Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text
                    className="text-xs uppercase tracking-[0.2em] text-slate-500"
                    numberOfLines={1}>
                    {item.genres.join(' · ')}
                  </Text>
                  <Text className="text-sm text-slate-600/80">{item.totalTime}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-base text-muted-foreground">No matches found.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
