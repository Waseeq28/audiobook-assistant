import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

interface AIAssistantButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AIAssistantButton({
  onPress,
  isLoading = false,
  disabled = false,
}: AIAssistantButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg disabled:bg-gray-400">
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
      )}
    </TouchableOpacity>
  );
}
