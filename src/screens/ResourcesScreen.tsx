/**
 * EduSphere — screens/ResourcesScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Resources Screen
 *
 * Follows the same design system as HomeScreen.tsx / GroupsScreen.tsx
 * (shared theme, card style, spacing, typography). The bottom nav bar is
 * not rendered here — it lives once, globally, in navigation/CustomTabBar.tsx.
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { ResourceData, MainTabParamList, RootStackParamList } from '../navigation/types';

// Navigation from this screen needs to reach screens in the root stack
// sitting above the tabs — ResourceDetails and UploadResource both live there.
type ResourcesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Resources'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------
type FileType = 'PDF' | 'DOCX' | 'PPTX';

type FilterKey =
  | 'All'
  | 'Past Questions'
  | 'Lecture Notes'
  | 'Slides'
  | 'Assignments'
  | 'Study Guides'
  | 'My Uploads'
  | 'Saved';

interface FeaturedResource {
  id: string;
  title: string;
  courseCode: string;
  fileType: FileType;
  size: string;
  uploaded: string;
  downloads: number;
  category: FilterKey;
}

interface RecentUpload {
  id: string;
  title: string;
  fileType: FileType;
  size: string;
  uploaded: string;
  courseCode: string;
  category: FilterKey;
}

interface PopularCourse {
  id: string;
  code: string;
  name: string;
  resourceCount: number;
}

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const FILTERS: FilterKey[] = [
  'All',
  'Past Questions',
  'Lecture Notes',
  'Slides',
  'Assignments',
  'Study Guides',
  'My Uploads',
  'Saved',
];

const FEATURED_RESOURCES: FeaturedResource[] = [
  {
    id: 'ft1',
    title: 'CSM 357 Past Questions',
    courseCode: 'CSM 357',
    fileType: 'PDF',
    size: '2.4 MB',
    uploaded: 'Uploaded 2h ago',
    downloads: 128,
    category: 'Past Questions',
  },
  {
    id: 'ft2',
    title: 'MTH 263 Calculus II Notes',
    courseCode: 'MTH 263',
    fileType: 'DOCX',
    size: '1.6 MB',
    uploaded: 'Uploaded 1d ago',
    downloads: 86,
    category: 'Lecture Notes',
  },
];

const RECENT_UPLOADS: RecentUpload[] = [
  {
    id: 'ru1',
    title: 'Data Structures - Slide Deck',
    fileType: 'PPTX',
    size: '3.1 MB',
    uploaded: 'Uploaded 2d ago',
    courseCode: 'CSM 351',
    category: 'Slides',
  },
  {
    id: 'ru2',
    title: 'Database Systems Summary Notes',
    fileType: 'PDF',
    size: '1.9 MB',
    uploaded: 'Uploaded 3d ago',
    courseCode: 'CSM 357',
    category: 'Lecture Notes',
  },
  {
    id: 'ru3',
    title: 'Artificial Intelligence Tutorial Questions',
    fileType: 'PDF',
    size: '2.7 MB',
    uploaded: 'Uploaded 4d ago',
    courseCode: 'CSM 461',
    category: 'Assignments',
  },
  {
    id: 'ru4',
    title: 'Microeconomics Revision Notes',
    fileType: 'DOCX',
    size: '1.4 MB',
    uploaded: 'Uploaded 5d ago',
    courseCode: 'ECN 262',
    category: 'Study Guides',
  },
];

const POPULAR_COURSES: PopularCourse[] = [
  { id: 'pc1', code: 'CSM 351', name: 'Data Structures', resourceCount: 12 },
  { id: 'pc2', code: 'CSM 357', name: 'Database Systems', resourceCount: 18 },
  { id: 'pc3', code: 'MTH 263', name: 'Calculus II', resourceCount: 9 },
  { id: 'pc4', code: 'CSM 461', name: 'Artificial Intelligence', resourceCount: 15 },
];

// File-type visual mapping shared by badges and list icons.
const FILE_TYPE_STYLES: Record<FileType, { bg: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  PDF: { bg: '#FDEAEA', color: '#D93A3A', icon: 'file-text' },
  DOCX: { bg: '#E7EEFD', color: '#2D3FE0', icon: 'file-text' },
  PPTX: { bg: '#FEF0E2', color: '#E08A1F', icon: 'file' },
};

// -----------------------------------------------------------------------
// SMALL REUSABLE COMPONENTS
// -----------------------------------------------------------------------

/** File-type badge with color coding by extension */
const FileBadge: React.FC<{ type: FileType }> = ({ type }) => {
  const style = FILE_TYPE_STYLES[type];
  return (
    <View style={[styles.fileBadge, { backgroundColor: style.bg }]}>
      <Text style={[styles.fileBadgeText, { color: style.color }]}>{type}</Text>
    </View>
  );
};

/** Circular file-type icon used in the recent uploads list */
const FileIcon: React.FC<{ type: FileType }> = ({ type }) => {
  const style = FILE_TYPE_STYLES[type];
  return (
    <View style={[styles.fileIconWrap, { backgroundColor: style.bg }]}>
      <Feather name={style.icon} size={16} color={style.color} />
    </View>
  );
};

/** Section header with title + optional "View all" action */
const SectionHeader: React.FC<{ title: string; onPressViewAll?: () => void }> = ({
  title,
  onPressViewAll,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onPressViewAll && (
      <TouchableOpacity onPress={onPressViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.viewAllText}>View all</Text>
      </TouchableOpacity>
    )}
  </View>
);

/** Empty state shown when no resources match the current search / filter */
const EmptyState: React.FC<{ onUpload: () => void }> = ({ onUpload }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <Feather name="inbox" size={28} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>No resources found</Text>
    <Text style={styles.emptySubtitle}>
      Try another search or upload a new resource.
    </Text>
    <TouchableOpacity style={styles.emptyUploadButton} onPress={onUpload} activeOpacity={0.85}>
      <Feather name="upload" size={16} color={COLORS.white} />
      <Text style={styles.emptyUploadButtonText}>Upload Resource</Text>
    </TouchableOpacity>
  </View>
);

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
// Featured/Recent items here carry only display fields — ResourceDetails
// needs the fuller ResourceData shape (uploader, rating, visibility, etc).
// These helpers fill in reasonable defaults for the fields this screen's
// sample data doesn't track yet, so navigation always gets a valid object.
const toResourceData = (item: {
  id: string;
  title: string;
  fileType: FileType;
  courseCode: string;
  size: string;
  uploaded: string;
  category: FilterKey;
  downloads?: number;
}): ResourceData => ({
  id: item.id,
  title: item.title,
  fileType: item.fileType,
  courseCode: item.courseCode,
  category: item.category,
  description: `Shared study material for ${item.courseCode}.`,
  size: item.size,
  uploaded: item.uploaded,
  downloads: item.downloads ?? 0,
  saves: 0,
  rating: 4.5,
  visibility: 'Public',
  uploader: {
    name: 'EduSphere Student',
    initials: 'ES',
    programme: 'BSc Computer Science',
    level: 'Level 300',
    verified: false,
  },
});

const ResourcesScreen: React.FC = () => {
  const navigation = useNavigation<ResourcesScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const matchesQuery = (title: string, courseCode: string) => {
    if (searchQuery.trim().length === 0) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || courseCode.toLowerCase().includes(q);
  };

  const filteredFeatured = useMemo(() => {
    return FEATURED_RESOURCES.filter((item) => {
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Saved' && savedIds.has(item.id)) ||
        item.category === activeFilter;
      return matchesFilter && matchesQuery(item.title, item.courseCode);
    });
  }, [activeFilter, searchQuery, savedIds]);

  const filteredRecent = useMemo(() => {
    return RECENT_UPLOADS.filter((item) => {
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Saved' && savedIds.has(item.id)) ||
        item.category === activeFilter;
      return matchesFilter && matchesQuery(item.title, item.courseCode);
    });
  }, [activeFilter, searchQuery, savedIds]);

  const hasNoResults = filteredFeatured.length === 0 && filteredRecent.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* HEADER                                                      */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>Resources</Text>
              <Text style={styles.headerSubtitle}>Find notes, slides, and past questions</Text>
            </View>

            <TouchableOpacity style={styles.uploadIconButton} activeOpacity={0.7}>
              <Feather name="upload" size={19} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* SEARCH BAR                                                  */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, past questions, courses..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY FILTER CHIPS                                       */}
        {/* ---------------------------------------------------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* EMPTY STATE (shown only when nothing matches)               */}
        {/* ---------------------------------------------------------- */}
        {hasNoResults && (
          <EmptyState onUpload={() => navigation.navigate('UploadResource')} />
        )}

        {/* ---------------------------------------------------------- */}
        {/* FEATURED RESOURCES                                          */}
        {/* ---------------------------------------------------------- */}
        {filteredFeatured.length > 0 && (
          <>
            <SectionHeader title="Featured Resources" />
            <View style={styles.stackedCards}>
              {filteredFeatured.map((item) => {
                const isSaved = savedIds.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.featuredCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ResourceDetails', { resource: toResourceData(item) })}
                  >
                    <View style={styles.featuredTopRow}>
                      <FileBadge type={item.fileType} />

                      <TouchableOpacity
                        onPress={() => toggleSaved(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather
                          name="bookmark"
                          size={18}
                          color={isSaved ? COLORS.primary : COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.featuredTitle}>{item.title}</Text>

                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{item.courseCode}</Text>
                    </View>

                    <View style={styles.featuredMetaRow}>
                      <Text style={styles.featuredMetaText}>
                        {item.fileType} • {item.size} • {item.uploaded}
                      </Text>
                    </View>

                    <View style={styles.featuredFooterRow}>
                      <View style={styles.downloadCountRow}>
                        <Feather name="download" size={13} color={COLORS.textSecondary} />
                        <Text style={styles.downloadCountText}>{item.downloads} downloads</Text>
                      </View>

                      <TouchableOpacity style={styles.downloadButton} activeOpacity={0.85}>
                        <Feather name="download" size={14} color={COLORS.white} />
                        <Text style={styles.downloadButtonText}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* RECENT UPLOADS                                              */}
        {/* ---------------------------------------------------------- */}
        {filteredRecent.length > 0 && (
          <>
            <SectionHeader title="Recent Uploads" onPressViewAll={() => {}} />
            <View style={styles.recentCard}>
              {filteredRecent.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.recentRow,
                    index !== filteredRecent.length - 1 && styles.recentRowDivider,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ResourceDetails', { resource: toResourceData(item) })}
                >
                  <FileIcon type={item.fileType} />

                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.recentMetaRow}>
                      <Text style={styles.recentMetaText} numberOfLines={1}>
                        {item.fileType} • {item.size} • {item.uploaded}
                      </Text>
                    </View>
                    <View style={styles.recentCourseChip}>
                      <Text style={styles.recentCourseChipText}>{item.courseCode}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.recentIconButton} activeOpacity={0.7}>
                    <Feather name="download" size={16} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.recentIconButton} activeOpacity={0.7}>
                    <Feather name="more-vertical" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* POPULAR COURSES                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Popular Courses" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularScroll}
        >
          {POPULAR_COURSES.map((course) => (
            <TouchableOpacity key={course.id} style={styles.popularCard} activeOpacity={0.85}>
              <View style={styles.popularAccent} />
              <Text style={styles.popularCode}>{course.code}</Text>
              <Text style={styles.popularName} numberOfLines={1}>
                {course.name}
              </Text>
              <View style={styles.popularCountRow}>
                <Feather name="file-text" size={12} color={COLORS.primary} />
                <Text style={styles.popularCountText}>{course.resourceCount} resources</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* UPLOAD RESOURCE — large call-to-action card                 */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity
          style={styles.uploadCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('UploadResource')}
        >
          <View style={styles.uploadIconWrap}>
            <Feather name="upload" size={20} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadCardTitle}>Upload Resource</Text>
            <Text style={styles.uploadCardSubtitle}>
              Share notes, slides, or past questions
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Bottom spacer so content isn't hidden behind the tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ------------------------------------------------------------ */}
      {/* FLOATING ACTION BUTTON (alternative quick-upload entry point) */}
      {/* ------------------------------------------------------------ */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('UploadResource')}
      >
        <Feather name="plus" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ResourcesScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const CARD_GAP = 14;
const H_PADDING = 20;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  // ---------------- HEADER ----------------
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  uploadIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },

  // ---------------- SEARCH BAR ----------------
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: H_PADDING,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    fontSize: 14.5,
    color: COLORS.textPrimary,
  },

  // ---------------- FILTER CHIPS ----------------
  filterScroll: {
    paddingHorizontal: H_PADDING,
    paddingVertical: 18,
  },
  filterChip: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },

  // ---------------- SECTION HEADER ----------------
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  stackedCards: {
    paddingHorizontal: H_PADDING,
  },

  // ---------------- SHARED BADGES ----------------
  courseBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  courseBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  fileBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fileBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // ---------------- FEATURED RESOURCES ----------------
  featuredCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  featuredMetaRow: {
    marginTop: 8,
  },
  featuredMetaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  featuredFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  downloadCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadCountText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  downloadButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 6,
  },

  // ---------------- RECENT UPLOADS ----------------
  recentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    paddingHorizontal: 14,
    ...SHADOW,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  recentRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fileIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
    marginRight: 8,
  },
  recentTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recentMetaRow: {
    marginBottom: 6,
  },
  recentMetaText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  recentCourseChip: {
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recentCourseChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  recentIconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---------------- POPULAR COURSES ----------------
  popularScroll: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 4,
  },
  popularCard: {
    width: SCREEN_WIDTH * 0.4,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginRight: CARD_GAP,
    overflow: 'hidden',
    ...SHADOW,
  },
  popularAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },
  popularCode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 6,
  },
  popularName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  popularCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  popularCountText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },

  // ---------------- UPLOAD RESOURCE CARD (CTA) ----------------
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: H_PADDING,
    marginTop: 8,
    padding: 18,
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  uploadIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uploadCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  uploadCardSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // ---------------- FLOATING ACTION BUTTON ----------------
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  // ---------------- EMPTY STATE ----------------
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PADDING,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },
  emptyUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },
  emptyUploadButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
});
