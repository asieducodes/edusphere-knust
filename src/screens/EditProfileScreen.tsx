import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius } from '../theme/colors';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'EditProfile'>;

const dropdownRows: Array<{ key: string; label: string }> = [
  { key: 'programme', label: 'Programme' },
  { key: 'department', label: 'Department' },
  { key: 'college', label: 'College' },
  { key: 'level', label: 'Level' },
];

export default function EditProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: call userService.updateProfile once /api/users/me PATCH has real logic
      console.log('Saving profile (placeholder):', { fullName });
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Profile</Text>

        <Pressable style={styles.avatarRow} onPress={() => {}}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{(user?.full_name ?? 'S')[0]}</Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </Pressable>

        <Input label="Full Name" value={fullName} onChangeText={setFullName} />

        {dropdownRows.map((row) => (
          <Pressable key={row.key} style={styles.dropdownRow} onPress={() => {}}>
            <Text style={styles.dropdownLabel}>{row.label}</Text>
            <Text style={styles.dropdownValue}>{(user as any)?.[row.key] ?? 'Not set'}</Text>
          </Pressable>
        ))}

        <Button label="Save Changes" onPress={handleSave} loading={isSaving} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  avatarRow: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: radius.pill, marginBottom: spacing.sm },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: { color: colors.textInverse, fontSize: 28, fontWeight: '700' },
  changePhotoText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownLabel: { ...typography.body, color: colors.textPrimary },
  dropdownValue: { ...typography.body, color: colors.textSecondary },
  button: { marginTop: spacing.xl },
});