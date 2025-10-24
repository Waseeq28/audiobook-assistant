import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';

interface AIAssistantButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function AIAssistantButton({
  onPress,
  isLoading = false,
  disabled = false,
  label = 'Ask',
}: AIAssistantButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg disabled:bg-gray-400">
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-center text-xs font-semibold uppercase tracking-wide text-white">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
