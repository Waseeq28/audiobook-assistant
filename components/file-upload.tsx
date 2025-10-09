import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

interface FileUploadProps {
  onFileSelected: (fileUri: string, fileName: string) => void;
}

export function FileUpload({ onFileSelected }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        onFileSelected(file.uri, file.name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Document picker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={pickDocument}
      disabled={isLoading}
      className="mb-4 h-16 flex-row items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50">
      <Ionicons
        name={isLoading ? 'hourglass-outline' : 'cloud-upload-outline'}
        size={24}
        color="#3B82F6"
      />
      <Text className="ml-2 text-base font-medium text-blue-600">
        {isLoading ? 'Selecting...' : 'Upload Audio File'}
      </Text>
    </TouchableOpacity>
  );
}
