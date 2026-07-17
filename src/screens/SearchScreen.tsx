/**
 * EduSphere — screens/SearchScreen.tsx
 * -----------------------------------------------------------------------
 * Real cross-app search, reached from HomeScreen's search bar. Searches
 * Groups and Resources in parallel (the two browsable, searchable
 * domains the backend exposes a `search` param for) and shows both as
 * sectioned results — rather than the old behavior of just switching to
 * the Resources tab and losing whatever was typed.
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { LoadingView, EmptyState } from '../components/common';
import { useDiscoverGroups } from '../hooks/useGroups';
import { useResources } from '../hooks/useResources';
import { Resource } from '../types/resource';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const FILE_TYPE_STYLES: Record<Resource['fileType'], { bg: string; color: string }> = {
  PDF: { bg: '#FDEAEA', color: '#D93A3A' },
  DOCX: { bg: '#E7EEFD', color: '#2D3FE0' },
  PPTX: { bg: '#FEF0E2', color: '#E08A1F' },
  ZIP: { bg: '#F1F2F8', color: '#5B6172' },
};

const SearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(route.params?.initialQuery ?? '');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = debouncedQuery.length > 0;

  const groupsQuery = useDiscoverGroups({ search: debouncedQuery }, hasQuery);
  const resourcesQuery = useResources({ search: debouncedQuery }, hasQuery);

  const groups = groupsQuery.data?.items ?? [];
  const resources = resourcesQuery.data?.items ?? [];
  const isLoading = hasQuery && (groupsQuery.isLoading || resourcesQuery.isLoading);
  const hasResults = groups.length > 0 || resources.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ---------------------------------------------------------- */}
      {/* HEADER — the search bar itself                              */}
      {/* ---------------------------------------------------------- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={17} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups, resources, courses..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasQuery ? (
          <EmptyState
            icon="search"
            title="Search EduSphere"
            subtitle="Find study groups and shared resources across the whole app — not just one tab."
          />
        ) : isLoading ? (
          <LoadingView message="Searching..." />
        ) : !hasResults ? (
          <EmptyState
            icon="inbox"
            title="No results"
            subtitle={`Nothing matched "${debouncedQuery}". Try a different course code or keyword.`}
          />
        ) : (
          <>
            {/* ---------------------------------------------------- */}
            {/* GROUPS                                                */}
            {/* ---------------------------------------------------- */}
            {groups.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Groups ({groups.length})</Text>
                <View style={styles.listCard}>
                  {groups.map((group, index) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[styles.resultRow, index !== groups.length - 1 && styles.rowDivider]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
                    >
                      <View style={styles.groupBadge}>
                        <Text style={styles.groupBadgeText}>
                          {group.courseCode.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {group.name}
                        </Text>
                        <Text style={styles.resultMeta} numberOfLines={1}>
                          {group.courseCode} • {group.membersCount} members
                          {group.isJoined ? ' • Joined' : ''}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* ---------------------------------------------------- */}
            {/* RESOURCES                                             */}
            {/* ---------------------------------------------------- */}
            {resources.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Resources ({resources.length})</Text>
                <View style={styles.listCard}>
                  {resources.map((item, index) => {
                    const fileStyle = FILE_TYPE_STYLES[item.fileType];
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.resultRow, index !== resources.length - 1 && styles.rowDivider]}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('ResourceDetails', { resourceId: item.id })}
                      >
                        <View style={[styles.fileBadge, { backgroundColor: fileStyle.bg }]}>
                          <Text style={[styles.fileBadgeText, { color: fileStyle.color }]}>{item.fileType}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.resultMeta} numberOfLines={1}>
                            {item.courseCode} • {item.size}
                          </Text>
                        </View>
                        {item.rating !== undefined ? (
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color={COLORS.star} />
                            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const H_PADDING = 20;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 12,
  },

  // ---------------- Header ----------------
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOW,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // ---------------- Sections ----------------
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: H_PADDING,
    marginBottom: 10,
    marginTop: 8,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    marginBottom: 20,
    paddingHorizontal: 16,
    ...SHADOW,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  resultInfo: {
    flex: 1,
    marginRight: 8,
  },
  resultTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },

  groupBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  fileBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  fileBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.warning,
    marginLeft: 3,
  },
});
