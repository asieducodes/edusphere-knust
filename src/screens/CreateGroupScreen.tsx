import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { colors, spacing, typography } from '../theme/colors';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      // TODO: call groupService.createGroup once the /api/groups endpoint has real logic
      console.log('Creating group (placeholder):', { name, description, location });
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create a Study Group</Text>

        <Input label="Group Name" placeholder="e.g. MATH 251 Study Squad" value={name} onChangeText={setName} />
        <Input
          label="Description"
          placeholder="What's this group about?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <Input label="Meeting Location" placeholder="e.g. Main Library, 2nd floor" value={location} onChangeText={setLocation} />

        <Button label="Create Group" onPress={handleCreate} loading={isSubmitting} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  button: { marginTop: spacing.sm },
});