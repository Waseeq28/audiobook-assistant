import { Image, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { LibriVoxAuthor } from '@/lib/types';

interface BookHeaderProps {
  title: string;
  authors: LibriVoxAuthor[];
  genres: Array<{ id: string; name: string }>;
  totalTime: string;
  description: string;
  coverUrl?: string;
}

export function BookHeader({
  title,
  authors,
  genres,
  totalTime,
  description,
  coverUrl,
}: BookHeaderProps) {
  return (
    <View className="pb-6 pt-8">
      <View className="items-center">
        <Image
          source={{ uri: coverUrl || 'https://placehold.co/200x300?text=No+Cover' }}
          className="h-48 w-32 rounded-xl bg-muted"
          resizeMode="cover"
        />
      </View>
      <Text className="mt-6 text-3xl font-bold" numberOfLines={3}>
        {title}
      </Text>
      <Text className="mt-2 text-base text-muted-foreground" numberOfLines={2}>
        Author: {authors.map((a) => `${a.first_name} ${a.last_name}`).join(', ')}
      </Text>
      <Text className="mt-3 text-sm text-muted-foreground">
        Genre: {genres.map((g) => g.name).join(' · ')}
      </Text>
      <Text className="mt-3 text-sm text-muted-foreground">Total time: {totalTime}</Text>
      <Text className="mt-5 text-base leading-6 text-foreground/90">{description}</Text>
      <Text className="mt-6 text-lg font-semibold">Sections</Text>
    </View>
  );
}
