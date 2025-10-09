import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { AudioPlayer } from '@/components/audio-player';
import { type LibriVoxSection } from '@/lib/types';

interface SectionItemProps {
  section: LibriVoxSection;
}

export function SectionItem({ section }: SectionItemProps) {
  return (
    <View className="mb-3 rounded-xl border border-border bg-card p-4">
      <Text className="text-base font-medium" numberOfLines={2}>
        {section.title}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        Section {section.section_number} • {section.playtime}
      </Text>

      <AudioPlayer
        section={section}
        onPlaybackEnd={() => console.log('Playback ended for:', section.title)}
        onAIAssistantPress={() => console.log('AI Assistant activated for:', section.title)}
      />
    </View>
  );
}
