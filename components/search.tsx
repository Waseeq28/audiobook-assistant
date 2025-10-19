import { useState } from 'react';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SearchItem } from '@/components/search-item';
import { FileUpload } from '@/components/file-upload';
import { searchAudiobooksByTitle } from '@/lib/librivox-api';
import { LibriVoxAudiobook } from '@/lib/types';

type UploadedFile = {
  localUri: string;
  name: string;
  storagePath: string;
  signedUrl?: string;
  mimeType?: string;
};

interface SearchProps {
  onBookSelect?: (book: LibriVoxAudiobook) => void;
  selectedBookId?: string | null;
  onUploadComplete?: (file: UploadedFile) => void;
  uploadedFile?: UploadedFile | null;
}

export function Search({
  onBookSelect,
  selectedBookId,
  onUploadComplete,
  uploadedFile,
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibriVoxAudiobook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalUpload, setInternalUpload] = useState<UploadedFile | null>(null);

  const uploadControlled = uploadedFile !== undefined;
  const activeUpload = uploadControlled ? (uploadedFile ?? null) : internalUpload;

  const handleUploadComplete = async (file: UploadedFile) => {
    if (!uploadControlled) {
      setInternalUpload(file);
    }
    setResults([]);
    setQuery('');
    onUploadComplete?.(file);
  };

  const performSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const response = await searchAudiobooksByTitle(trimmed);
      setResults(response.books || []);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-6 pb-6">
      <FileUpload onUploadComplete={handleUploadComplete} />

      {activeUpload && (
        <View className="mb-4 rounded-xl bg-green-50 p-3">
          <Text className="text-sm font-medium text-green-800">📁 {activeUpload.name}</Text>
          <Text className="text-xs text-green-600">Stored at {activeUpload.storagePath}</Text>
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

      <View className="mt-5 space-y-3">
        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        ) : results.length > 0 ? (
          results.map((item) => (
            <SearchItem
              key={item.id}
              id={item.id}
              title={item.title}
              authors={item.authors}
              genres={item.genres}
              totalTime={item.totaltime}
              coverUrl={item.coverart_thumbnail || item.coverart_jpg}
              onSelect={onBookSelect ? () => onBookSelect(item) : undefined}
              isActive={selectedBookId === item.id}
            />
          ))
        ) : query.trim().length > 0 ? (
          <View className="items-center justify-center py-10">
            <Text className="text-base text-muted-foreground">
              {error ? error : 'No matches found.'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
