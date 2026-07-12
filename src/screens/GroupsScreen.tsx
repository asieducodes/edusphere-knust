import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from '../navigation/types';
import { EmptyState } from '../components/common';
import { colors, spacing, typography } from '../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Groups'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function GroupsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Groups</Text>
        <Pressable onPress={() => {}} hitSlop={10}>
          <Text style={styles.filterIcon}>Filter</Text>
        </Pressable>
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={() => null}
        ListEmptyComponent={
          <EmptyState
            title="No study groups yet"
            subtitle="Once the backend is connected, groups for your courses will appear here."
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateGroup')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  filterIcon: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  listContent: { flexGrow: 1, paddingHorizontal: spacing.lg },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: colors.textInverse, fontSize: 28, fontWeight: '600', lineHeight: 30 },
});