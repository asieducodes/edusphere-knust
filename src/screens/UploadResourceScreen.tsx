import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { colors, spacing, typography, radius } from '../theme/colors';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'UploadResource'>;

export default function UploadResourceScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFile = () => {
    // TODO: wire to expo-document-picker once file selection is implemented
    setFileName('sample-past-question.pdf');
  };

  const handleUpload = async () => {
    if (!title.trim() || !fileName) return;
    setIsUploading(true);
    try {
      // TODO: call resourceService.uploadResource with real multipart FormData
      console.log('Uploading resource (placeholder):', { title, description, fileName });
      navigation.goBack();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Upload a Resource</Text>

        <Pressable style={styles.filePicker} onPress={handlePickFile}>
          <Text style={styles.filePickerText}>{fileName ?? 'Tap to choose a file'}</Text>
        </Pressable>

        <Input label="Title" placeholder="e.g. MATH 251 Past Questions 2024" value={title} onChangeText={setTitle} />
        <Input label="Description (optional)" value={description} onChangeText={setDescription} multiline numberOfLines={3} />

        <Button label="Upload" onPress={handleUpload} loading={isUploading} style={styles.button} disabled={!fileName} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  filePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  filePickerText: { ...typography.body, color: colors.textSecondary },
  button: { marginTop: spacing.sm },
});