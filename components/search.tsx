import { useEffect, useState } from 'react';
import { FlatList, TextInput, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { SearchItem } from '@/components/search-item';
import { FileUpload } from '@/components/file-upload';
import { UploadedAudioPlayer } from '@/components/uploaded-audio-player';
import { searchAudiobooksByTitle } from '@/lib/librivox-api';
import { LibriVoxAudiobook } from '@/lib/types';

export function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibriVoxAudiobook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ uri: string; name: string } | null>(null);

  // An async function to perform the actual search for a given query.
  const performSearch = async () => {
    if (!query.trim()) return;

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
  // COMMENTED OUT FOR DEVELOPMENT - uncomment for production
  // const fetchInitialList = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await searchAudiobooksByTitle('', { limit: 20, offset: 0 });
  //     setResults(response.books || []);
  //   } catch (err) {
  //     setError('Failed to load initial audiobooks');
  //     console.error('Error loading initial audiobooks:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // If the query is empty, fetch the initial list immediately.
  // This handles both the component's first load and when a user clears the search input.
  // COMMENTED OUT FOR DEVELOPMENT - uncomment for production
  // if (query.trim() === '') {
  //   fetchInitialList();
  //   // Exit the effect early; no need to set up a timer.
  //   return;
  // }

  const handleFileSelected = (fileUri: string, fileName: string) => {
    setUploadedFile({ uri: fileUri, name: fileName });
    // Clear search results when uploading a file
    setResults([]);
  };

  return (
    <>
      <View className="px-6 pb-4">
        <FileUpload onFileSelected={handleFileSelected} />

        {uploadedFile && (
          <View className="mb-4 rounded-xl bg-green-50 p-3">
            <Text className="text-sm font-medium text-green-800">📁 {uploadedFile.name}</Text>
            <Text className="text-xs text-green-600">Ready for AI testing</Text>
          </View>
        )}

        <View className="mt-2 flex-row items-center space-x-3">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title, author, or genre"
            className="h-12 flex-1 rounded-full border border-input bg-card px-5 text-base"
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />
          <TouchableOpacity
            onPress={performSearch}
            disabled={loading || !query.trim()}
            className="h-12 w-12 items-center justify-center rounded-full bg-blue-600 disabled:bg-gray-400">
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="font-semibold text-white">→</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {uploadedFile ? (
        <View className="px-6 pb-6">
          <UploadedAudioPlayer
            fileUri={uploadedFile.uri}
            fileName={uploadedFile.name}
            onPlaybackEnd={() => console.log('Uploaded audio playback ended')}
            onAIAssistantPress={() => console.log('AI Assistant activated for uploaded file')}
          />
        </View>
      ) : (
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
      )}
    </>
  );
}
