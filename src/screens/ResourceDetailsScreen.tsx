import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, EmptyState } from '../components/common';
import { colors, spacing, typography } from '../theme/colors';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ResourceDetails'>;

export default function ResourceDetailsScreen({ route }: Props) {
  const { resourceId } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Resource</Text>
        <Pressable onPress={() => {}} hitSlop={10}>
          <Text style={styles.shareIcon}>Share</Text>
        </Pressable>
      </View>
      <Text style={styles.resourceId}>Resource ID: {resourceId}</Text>

      <Button label="Download" onPress={() => {}} style={styles.button} />
      <Button label="Preview" variant="secondary" onPress={() => {}} style={styles.button} />

      <Text style={styles.sectionTitle}>Related Resources</Text>
      <Card>
        <EmptyState title="No related resources yet" />
      </Card>

      <Pressable onPress={() => {}}>
        <Text style={styles.reportText}>Report this resource</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h1, color: colors.textPrimary },
  shareIcon: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  resourceId: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  button: { marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  reportText: { ...typography.bodySmall, color: colors.error, textAlign: 'center', marginTop: spacing.xl },
});