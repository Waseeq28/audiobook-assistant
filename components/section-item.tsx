import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { type MockAudioSection } from '@/lib/mockData';

interface SectionItemProps {
  section: MockAudioSection;
}

export function SectionItem({ section }: SectionItemProps) {
  return (
    <View className="mb-3 rounded-xl border border-border bg-card p-4">
      <Text className="text-base font-medium" numberOfLines={2}>
        {section.title}
      </Text>
      <Text className="mt-2 text-sm text-muted-foreground">{section.duration}</Text>
      <Text className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        Preview unavailable in mock mode
      </Text>
    </View>
  );
}
