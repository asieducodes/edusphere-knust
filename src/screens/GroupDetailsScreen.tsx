import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, EmptyState } from '../components/common';
import { colors, spacing, typography } from '../theme/colors';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'GroupDetails'>;

export default function GroupDetailsScreen({ route }: Props) {
  const { groupId } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Group</Text>
        <Pressable onPress={() => {}} hitSlop={10}>
          <Text style={styles.moreIcon}>More</Text>
        </Pressable>
      </View>
      <Text style={styles.groupId}>Group ID: {groupId}</Text>

      <View style={styles.actionsRow}>
        <Button label="Start Discussion" variant="secondary" onPress={() => {}} style={styles.actionButton} />
        <Button label="Schedule Session" variant="secondary" onPress={() => {}} style={styles.actionButton} />
      </View>
      <Button label="Invite Member" variant="ghost" onPress={() => {}} />

      <Text style={styles.sectionTitle}>Discussion</Text>
      <Card>
        <EmptyState title="No discussion yet" subtitle="Be the first to start a conversation in this group." />
      </Card>

      <Text style={styles.sectionTitle}>Shared Resources</Text>
      <Card>
        <EmptyState title="No resources shared yet" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h1, color: colors.textPrimary },
  moreIcon: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  groupId: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  actionButton: { flex: 1 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
});