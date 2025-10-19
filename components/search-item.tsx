import { Image, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { LibriVoxAuthor } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchItemProps {
  id: string;
  title: string;
  authors: LibriVoxAuthor[];
  genres: Array<{ id: string; name: string }>;
  totalTime: string;
  coverUrl?: string;
  onSelect?: () => void;
  isActive?: boolean;
}

export function SearchItem({
  id,
  title,
  authors,
  genres,
  totalTime,
  coverUrl,
  onSelect,
  isActive,
}: SearchItemProps) {
  const content = (
    <View
      className={cn(
        'flex-row rounded-3xl px-5 py-4',
        isActive ? 'border border-blue-300 bg-blue-500/10' : 'bg-slate-900/5'
      )}>
      <Image
        source={{ uri: coverUrl || 'https://placehold.co/200x300?text=No+Cover' }}
        className="mr-4 h-24 w-16 rounded-xl bg-slate-200/80"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold" numberOfLines={2}>
          {title}
        </Text>
        <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
          {authors.map((a) => `${a.first_name} ${a.last_name}`).join(', ')}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs uppercase tracking-[0.2em] text-slate-500" numberOfLines={1}>
            {genres.map((g) => g.name).join(' · ')}
          </Text>
          <Text className="text-sm text-slate-600/80">{totalTime}</Text>
        </View>
      </View>
    </View>
  );

  if (onSelect) {
    return (
      <TouchableOpacity onPress={onSelect} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <Link href={`/book/${id}`} asChild>
      <TouchableOpacity accessibilityRole="button">{content}</TouchableOpacity>
    </Link>
  );
}
