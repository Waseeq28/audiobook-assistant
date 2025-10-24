import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useAudioUpload } from '@/hooks';

interface FileUploadProps {
  onUploadComplete: (file: {
    localUri: string;
    name: string;
    storagePath: string;
    signedUrl?: string;
    mimeType?: string;
  }) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{
    localUri: string;
    name: string;
    storagePath: string;
    signedUrl?: string;
    mimeType?: string;
  } | null>(null);
  const { upload, loading, error } = useAudioUpload();

  const pickDocument = async () => {
    try {
      setIsSelecting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const uploadResult = await upload({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        });

        const completedUpload = {
          localUri: file.uri,
          name: file.name,
          storagePath: uploadResult.path,
          signedUrl: uploadResult.signedUrl,
          mimeType: uploadResult.mimeType ?? file.mimeType,
        };

        setUploadInfo(completedUpload);
        onUploadComplete(completedUpload);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Document picker error:', error);
      setUploadInfo(null);
    } finally {
      setIsSelecting(false);
    }
  };

  if (error) {
    console.error('Audio upload error:', error);
  }

  const isBusy = isSelecting || loading;

  return (
    <>
      <TouchableOpacity
        onPress={pickDocument}
        disabled={isBusy}
        className="mb-4 h-16 flex-row items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50">
        <Ionicons
          name={isBusy ? 'hourglass-outline' : 'cloud-upload-outline'}
          size={24}
          color="#3B82F6"
        />
        <Text className="ml-2 text-base font-medium text-blue-600">
          {isBusy ? 'Selecting...' : 'Upload Audio File'}
        </Text>
      </TouchableOpacity>

      {uploadInfo && (
        <View className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Text className="text-sm font-semibold text-blue-700">Uploaded clip ready</Text>
          <Text className="mt-1 text-xs text-blue-600">Path: {uploadInfo.storagePath}</Text>
          {uploadInfo.signedUrl && (
            <Text
              className="mt-1 text-xs text-blue-600 underline"
              onPress={() => {
                const signedUrl = uploadInfo.signedUrl;
                if (!signedUrl) return;
                Linking.openURL(signedUrl);
              }}>
              Open signed URL
            </Text>
          )}
        </View>
      )}
    </>
  );
}
