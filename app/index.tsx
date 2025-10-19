import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Text } from '@/components/ui/text';
import { Search } from '@/components/search';
import { VoiceRecorder } from '@/components/voice-recorder-test';
import {
  UploadedAudioPlayer,
  type ClipTranscriptionPayload,
} from '@/components/uploaded-audio-player';
import { AudioPlayer } from '@/components/audio-player';
import { getAudiobookById } from '@/lib/librivox-api';
import { LibriVoxAudiobook, LibriVoxSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const [clipContext, setClipContext] = useState<ClipTranscriptionPayload | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'waiting' | 'streaming'>('idle');
  const [assistantOutput, setAssistantOutput] = useState('');
  const [assistantError, setAssistantError] = useState<string | null>(null);

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
    setClipContext(null);
    setAssistantOutput('');
    setAssistantError(null);
  };

  const handleUploadComplete = (file: UploadedFile) => {
    setUploadedFile(file);
    setSelectedBookId(null);
    setClipContext(null);
    setAssistantOutput('');
    setAssistantError(null);
  };

  const handleClipContext = (payload: ClipTranscriptionPayload) => {
    setClipContext((prev) =>
      prev && prev.clipUrl === payload.clipUrl
        ? { ...prev, transcription: payload.transcription ?? prev.transcription }
        : payload
    );
    setAssistantOutput('');
    setAssistantError(null);
  };

  const handleVoiceTranscript = (transcript: string | null) => {
    setVoiceTranscript(transcript);
    setAssistantOutput('');
    setAssistantError(null);
  };

  const sendTranscriptsToAssistant = async () => {
    if (!clipContext?.transcription || !voiceTranscript) {
      setAssistantError('Need both clip and recording transcripts first.');
      return;
    }

    setAssistantStatus('waiting');
    setAssistantOutput('');
    setAssistantError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/assistant-stream`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clip: {
              url: clipContext.clipUrl,
              transcript: clipContext.transcription,
              startSeconds: clipContext.startSeconds,
              endSeconds: clipContext.endSeconds,
              source: clipContext.sourceType,
            },
            userRecording: {
              transcript: voiceTranscript,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Assistant request failed');
      }

      const { message } = (await response.json()) as { message?: string };
      setAssistantOutput(message ?? '');
      setAssistantStatus('idle');
    } catch (error) {
      console.error('Assistant streaming error:', error);
      setAssistantStatus('idle');
      setAssistantError('Failed to fetch assistant response');
    }
  };

  const canSend = useMemo(() => {
    return Boolean(clipContext?.transcription && voiceTranscript);
  }, [clipContext?.transcription, voiceTranscript]);

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
                  onAIAssistantPress={handleClipContext}
                  onTranscriptionChange={(transcription) => {
                    setClipContext((prev) => (prev ? { ...prev, transcription } : prev));
                  }}
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
                onAIAssistantPress={handleClipContext}
                onTranscriptionChange={(transcription) => {
                  setClipContext((prev) => (prev ? { ...prev, transcription } : prev));
                }}
              />
            </View>
          )}

          <VoiceRecorder onTranscriptionChange={handleVoiceTranscript} />

          <View className="mt-6 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="text-lg font-semibold text-slate-900">AI Assistant Response</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Sends the latest clip transcript and your recorded question to the assistant.
            </Text>

            <Button
              className="mt-4 bg-purple-600 active:bg-purple-700"
              onPress={sendTranscriptsToAssistant}
              disabled={
                !canSend || assistantStatus === 'waiting' || assistantStatus === 'streaming'
              }>
              <Text className="text-base font-semibold text-white">
                {assistantStatus === 'streaming'
                  ? 'Streaming...'
                  : assistantStatus === 'waiting'
                    ? 'Preparing...'
                    : 'Send transcripts'}
              </Text>
            </Button>

            <View className="mt-4 space-y-3">
              <View className="rounded-lg bg-slate-100 p-3">
                <Text className="text-xs uppercase tracking-wide text-slate-500">
                  Clip Transcript Snapshot
                </Text>
                <Text className="mt-2 text-sm text-slate-700">
                  {clipContext?.transcription ?? 'Clip transcript not captured yet.'}
                </Text>
              </View>

              <View className="rounded-lg bg-slate-100 p-3">
                <Text className="text-xs uppercase tracking-wide text-slate-500">
                  Recorded Question Transcript
                </Text>
                <Text className="mt-2 text-sm text-slate-700">
                  {voiceTranscript ?? 'Record a question to capture transcript.'}
                </Text>
              </View>
            </View>

            {assistantError && <Text className="mt-3 text-sm text-red-500">{assistantError}</Text>}

            {assistantOutput.length > 0 && (
              <View className="mt-4 rounded-lg bg-slate-100 p-4">
                <Text className="text-xs uppercase tracking-wide text-slate-500">
                  Assistant Reply
                </Text>
                <Text className="mt-2 text-sm text-slate-700">{assistantOutput}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
