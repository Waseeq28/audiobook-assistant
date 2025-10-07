import { Image, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';

interface SearchItemProps {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  totalTime: string;
  coverUrl: string;
}

export function SearchItem({ id, title, authors, genres, totalTime, coverUrl }: SearchItemProps) {
  return (
    <Link href={`/book/${id}`} asChild>
      <TouchableOpacity className="flex-row rounded-3xl bg-slate-900/5 px-5 py-4">
        <Image
          source={{ uri: coverUrl }}
          className="mr-4 h-24 w-16 rounded-xl bg-slate-200/80"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
            {authors.join(', ')}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs uppercase tracking-[0.2em] text-slate-500" numberOfLines={1}>
              {genres.join(' · ')}
            </Text>
            <Text className="text-sm text-slate-600/80">{totalTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
