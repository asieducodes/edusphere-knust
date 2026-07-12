import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common';
import { colors, spacing, typography, radius } from '../theme/colors';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

const quickActions = [
  { key: 'FindGroup', label: 'Find Group', target: 'Groups' as const },
  { key: 'CreateGroup', label: 'Create Group', target: 'CreateGroup' as const },
  { key: 'Resources', label: 'Resources', target: 'Resources' as const },
  { key: 'CampusMap', label: 'Campus Map', target: 'Map' as const },
];

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{(user?.full_name ?? 'S')[0]}</Text>
            </View>
          )}
          <Text style={styles.greeting}>Hi, {user?.full_name?.split(' ')[0] ?? 'there'}</Text>
        </View>
        <Pressable onPress={() => {}} hitSlop={10}>
          <Text style={styles.bellIcon}>Notifications</Text>
        </Pressable>
      </View>

      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.key}
            style={styles.quickActionCard}
            onPress={() => navigation.navigate(action.target as never)}
          >
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recommended for you</Text>
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          Your recommended study groups and resources will show up here once the backend is live.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: radius.pill, marginRight: spacing.sm },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarInitial: { color: colors.textInverse, fontWeight: '700' },
  greeting: { ...typography.h2, color: colors.textPrimary },
  bellIcon: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  quickActionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyCard: { alignItems: 'center' },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
});