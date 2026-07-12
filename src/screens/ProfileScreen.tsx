import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius } from '../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<MainStackParamList>
>;

const accountMenu = ['My Groups', 'My Uploads', 'Saved Resources', 'Ratings Received', 'Help & Support'];

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{(user?.full_name ?? 'S')[0]}</Text>
            </View>
          )}
          <View>
            <Text style={styles.name}>{user?.full_name ?? 'Student'}</Text>
            <Text style={styles.programme}>{user?.programme ?? 'Programme not set'}</Text>
          </View>
        </View>
        <Pressable onPress={() => {}} hitSlop={10}>
          <Text style={styles.settingsIcon}>Settings</Text>
        </Pressable>
      </View>

      <Pressable style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </Pressable>

      <View style={styles.menu}>
        {accountMenu.map((item) => (
          <Pressable key={item} style={styles.menuRow} onPress={() => {}}>
            <Text style={styles.menuLabel}>{item}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.menuRow} onPress={logout}>
          <Text style={[styles.menuLabel, styles.logoutLabel]}>Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: radius.pill, marginRight: spacing.md },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: { color: colors.textInverse, fontSize: 20, fontWeight: '700' },
  name: { ...typography.h3, color: colors.textPrimary },
  programme: { ...typography.bodySmall, color: colors.textSecondary },
  settingsIcon: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  editButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  editButtonText: { ...typography.button, color: colors.primary },
  menu: { borderTopWidth: 1, borderTopColor: colors.border },
  menuRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { ...typography.body, color: colors.textPrimary },
  logoutLabel: { color: colors.error, fontWeight: '600' },
});