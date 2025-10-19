import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Text } from '@/components/ui/text';
import { Search } from '@/components/search';
import { VoiceRecorder } from '@/components/voice-recorder-test';
import { UploadedAudioPlayer } from '@/components/uploaded-audio-player';
import { AudioPlayer } from '@/components/audio-player';
import { getAudiobookById } from '@/lib/librivox-api';
import { LibriVoxAudiobook, LibriVoxSection } from '@/lib/types';
import { cn } from '@/lib/utils';

type UploadedFile = {
  localUri: string;
  name: string;
  storagePath: string;
  signedUrl?: string;
  mimeType?: string;
};

export default function Home() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibriVoxAudiobook | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    if (!selectedBookId) {
      setSelectedBook(null);
      setSelectedSectionId(null);
      setBookLoading(false);
      setBookError(null);
      return;
    }

    let cancelled = false;
    setBookLoading(true);
    setBookError(null);

    (async () => {
      try {
        const book = await getAudiobookById(selectedBookId);
        if (cancelled) return;
        if (!book) {
          setSelectedBook(null);
          setSelectedSectionId(null);
          setBookError('Audiobook unavailable.');
          return;
        }
        setSelectedBook(book);
        const firstSection = book.sections?.[0]?.id ?? null;
        setSelectedSectionId(firstSection);
      } catch (error) {
        if (cancelled) return;
        setSelectedBook(null);
        setSelectedSectionId(null);
        setBookError('Failed to load audiobook.');
      } finally {
        if (!cancelled) {
          setBookLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBookId]);

  const sections = useMemo(() => selectedBook?.sections ?? [], [selectedBook]);
  const activeSection: LibriVoxSection | null = useMemo(() => {
    if (!sections.length || !selectedSectionId) return null;
    return sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null;
  }, [sections, selectedSectionId]);

  const handleBookSelect = (book: LibriVoxAudiobook) => {
    setUploadedFile(null);
    setSelectedBookId(book.id);
  };

  const handleUploadComplete = (file: UploadedFile) => {
    setUploadedFile(file);
    setSelectedBookId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-16">
        <View className="px-6 pb-4 pt-8">
          <Text className="text-xs uppercase tracking-wide text-muted-foreground">Prototype</Text>
          <Text className="text-2xl font-bold">
            {Constants.expoConfig?.name ?? 'Audiobook Assistant'}
          </Text>
        </View>

        <Search
          onBookSelect={handleBookSelect}
          selectedBookId={selectedBookId}
          onUploadComplete={handleUploadComplete}
          uploadedFile={uploadedFile}
        />

        <View className="px-6">
          {bookLoading && (
            <View className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
              <Text className="text-base font-semibold text-slate-700">Loading audiobook…</Text>
              <View className="mt-4 items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            </View>
          )}

          {bookError && !bookLoading && (
            <View className="mb-6 rounded-2xl bg-red-50 p-4">
              <Text className="text-sm font-medium text-red-600">{bookError}</Text>
            </View>
          )}

          {selectedBook && sections.length > 0 && (
            <View className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
              <Text className="text-lg font-semibold text-slate-900" numberOfLines={2}>
                {selectedBook.title}
              </Text>
              <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
                {selectedBook.authors
                  .map((author) => `${author.first_name} ${author.last_name}`)
                  .join(', ')}
              </Text>
              <Text className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                Select a section
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-3 gap-2">
                {sections.map((section) => {
                  return (
                    <TouchableOpacity
                      key={section.id}
                      onPress={() => setSelectedSectionId(section.id)}
                      className={cn(
                        'rounded-full border px-4 py-2',
                        section.id === activeSection?.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-200 bg-slate-100'
                      )}>
                      <Text
                        className={cn(
                          'text-sm',
                          section.id === activeSection?.id
                            ? 'font-semibold text-blue-600'
                            : 'text-slate-600'
                        )}>
                        {section.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {activeSection && (
                <AudioPlayer
                  section={activeSection}
                  onPlaybackEnd={() => {}}
                  onAIAssistantPress={() => {}}
                />
              )}
            </View>
          )}

          {uploadedFile && (
            <View className="mb-6">
              <UploadedAudioPlayer
                file={{
                  uri: uploadedFile.localUri,
                  name: uploadedFile.name,
                  storagePath: uploadedFile.storagePath,
                  signedUrl: uploadedFile.signedUrl,
                  mimeType: uploadedFile.mimeType,
                }}
                onPlaybackEnd={() => {}}
                onAIAssistantPress={() => {}}
              />
            </View>
          )}

          <VoiceRecorder />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
