import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from '../navigation/types';
import { EmptyState } from '../components/common';
import { colors, spacing, typography } from '../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Resources'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function ResourcesScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Pressable onPress={() => navigation.navigate('UploadResource')} hitSlop={10}>
          <Text style={styles.uploadIcon}>Upload</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Popular courses</Text>
      <FlatList
        data={[]}
        horizontal
        keyExtractor={(item: any) => item.id}
        renderItem={() => null}
        contentContainerStyle={styles.courseList}
        ListEmptyComponent={<Text style={styles.mutedText}>Course shortcuts will appear once resources are uploaded.</Text>}
      />

      <FlatList
        data={[]}
        keyExtractor={(item: any) => item.id}
        renderItem={() => null}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title="No resources yet" subtitle="Uploaded past questions and notes will show up here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary },
  uploadIcon: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  courseList: { paddingHorizontal: spacing.lg, minHeight: 40 },
  mutedText: { ...typography.bodySmall, color: colors.textSecondary },
  listContent: { flexGrow: 1, paddingHorizontal: spacing.lg, marginTop: spacing.md },
});