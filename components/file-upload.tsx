import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{
    localUri: string;
    name: string;
    storagePath: string;
    signedUrl?: string;
    mimeType?: string;
  } | null>(null);

  const pickDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'audio/m4a',
        } as any);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/upload-audio`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to upload audio');
        }

        const uploadResult = (await response.json()) as {
          path: string;
          signedUrl?: string;
          mimeType?: string;
        };

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
      setIsLoading(false);
    }
  };

  return (
    <>
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
