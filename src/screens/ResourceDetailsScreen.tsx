/**
 * EduSphere — screens/ResourceDetailsScreen.tsx
 * -----------------------------------------------------------------------
 * Opens on top of the bottom tabs (see navigation/AppNavigator.tsx) when
 * a resource row is tapped anywhere in the app. Receives an optional
 * `resource` object via route params — falls back to sample data if none
 * is passed, so this screen also works if opened directly for testing.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { ResourceData, RootStackParamList } from '../navigation/types';
import { ScreenHeader, SectionCard, InfoRow, FileTypeBadge, PrimaryButton, SecondaryButton } from '../components/common';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourceDetails'>;

// -----------------------------------------------------------------------
// FALLBACK SAMPLE DATA — used when no resource is passed via route params
// -----------------------------------------------------------------------
const SAMPLE_RESOURCE: ResourceData = {
  id: 'res-sample',
  title: 'Data Structures Past Questions',
  fileType: 'PDF',
  courseCode: 'CSM 357',
  category: 'Past Questions',
  description:
    'A collection of past examination questions to help students prepare for Data Structures and related problem-solving topics.',
  size: '2.4 MB',
  uploaded: 'Uploaded 2h ago',
  downloads: 128,
  saves: 34,
  rating: 4.8,
  visibility: 'Public',
  uploader: {
    name: 'Ama Mensah',
    initials: 'AM',
    programme: 'BSc Computer Science',
    level: 'Level 300',
    verified: true,
  },
};

// -----------------------------------------------------------------------
// LOCAL TYPES + STATIC SAMPLE DATA
// -----------------------------------------------------------------------
interface RelatedResource {
  id: string;
  title: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX';
  size: string;
}

interface FeedbackItem {
  id: string;
  text: string;
  author: string;
  time: string;
}

const RELATED_RESOURCES: RelatedResource[] = [
  { id: 'rr1', title: 'Linked List Lecture Notes', fileType: 'DOCX', size: '1.6 MB' },
  { id: 'rr2', title: 'Stacks and Queues Slides', fileType: 'PPTX', size: '3.1 MB' },
  { id: 'rr3', title: 'Algorithms Summary Notes', fileType: 'PDF', size: '1.9 MB' },
];

const FEEDBACK: FeedbackItem[] = [
  { id: 'fb1', text: 'Very useful for revision.', author: 'Kojo', time: '1d ago' },
  { id: 'fb2', text: 'Helped me prepare for the quiz.', author: 'Efua', time: '2d ago' },
];

const ResourceDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const resource: ResourceData = route.params?.resource ?? SAMPLE_RESOURCE;
  const [isSaved, setIsSaved] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        title="Resource Details"
        onBack={() => navigation.goBack()}
        rightIcon="more-vertical"
        onPressRight={() => {
          // Placeholder — hook up to an actions sheet (report, share, etc.)
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* RESOURCE HERO CARD                                          */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <FileTypeBadge type={resource.fileType} />
            <TouchableOpacity onPress={() => setIsSaved((prev) => !prev)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="bookmark" size={19} color={isSaved ? COLORS.primary : COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>{resource.title}</Text>

          <View style={styles.heroChipsRow}>
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>{resource.courseCode}</Text>
            </View>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{resource.category}</Text>
            </View>
          </View>

          <Text style={styles.heroDescription}>{resource.description}</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Feather name="download" size={13} color={COLORS.textSecondary} />
              <Text style={styles.heroStatText}>{resource.downloads} downloads</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Feather name="bookmark" size={13} color={COLORS.textSecondary} />
              <Text style={styles.heroStatText}>{resource.saves} saves</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Ionicons name="star" size={13} color={COLORS.star} />
              <Text style={styles.heroStatText}>{resource.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.heroMetaLine}>
            {resource.fileType} • {resource.size} • {resource.uploaded}
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* UPLOADED BY                                                 */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Uploaded By">
          <View style={styles.uploaderRow}>
            <View style={styles.uploaderAvatar}>
              <Text style={styles.uploaderInitials}>{resource.uploader.initials}</Text>
            </View>
            <View style={styles.uploaderInfo}>
              <View style={styles.uploaderNameRow}>
                <Text style={styles.uploaderName}>{resource.uploader.name}</Text>
                {resource.uploader.verified && (
                  <View style={styles.verifiedDot}>
                    <Ionicons name="checkmark" size={9} color={COLORS.white} />
                  </View>
                )}
              </View>
              <Text style={styles.uploaderMeta}>
                {resource.uploader.programme} • {resource.uploader.level}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* RESOURCE METADATA                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Resource Details">
          <InfoRow icon="file-text" label="File Type" value={resource.fileType} />
          <InfoRow icon="book-open" label="Course" value={resource.courseCode} />
          <InfoRow icon="tag" label="Category" value={resource.category} />
          <InfoRow icon="hard-drive" label="Size" value={resource.size} />
          <InfoRow icon="clock" label="Uploaded" value={resource.uploaded} />
          <InfoRow icon="eye" label="Visibility" value={resource.visibility} isLast />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* ACTION BUTTONS                                              */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.actionsWrap}>
          <PrimaryButton label="Download Resource" onPress={() => {}} icon="download" />
          <View style={{ height: 10 }} />
          <View style={styles.actionsRow}>
            <View style={{ flex: 1 }}>
              <SecondaryButton label="Preview" onPress={() => {}} icon="eye" />
            </View>
            <TouchableOpacity style={styles.iconActionButton} activeOpacity={0.85} onPress={() => setIsSaved((prev) => !prev)}>
              <Feather name="bookmark" size={18} color={isSaved ? COLORS.primary : COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconActionButton} activeOpacity={0.85}>
              <Feather name="share-2" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* RELATED RESOURCES                                           */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Related Resources</Text>
        </View>
        <View style={styles.listCard}>
          {RELATED_RESOURCES.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.relatedRow, index !== RELATED_RESOURCES.length - 1 && styles.rowDivider]}
              activeOpacity={0.7}
            >
              <FileTypeBadge type={item.fileType} />
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.relatedMeta}>
                  {item.fileType} • {item.size}
                </Text>
              </View>
              <TouchableOpacity style={styles.relatedIconButton} activeOpacity={0.7}>
                <Feather name="download" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* STUDENT FEEDBACK                                            */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student Feedback</Text>
        </View>
        <View style={styles.listCard}>
          {FEEDBACK.map((item, index) => (
            <View key={item.id} style={[styles.feedbackRow, index !== FEEDBACK.length - 1 && styles.rowDivider]}>
              <Feather name="message-circle" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
              <View style={styles.feedbackTextBlock}>
                <Text style={styles.feedbackText}>&ldquo;{item.text}&rdquo;</Text>
                <Text style={styles.feedbackMeta}>
                  By {item.author} • {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* REPORT BUTTON                                               */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity style={styles.reportButton} activeOpacity={0.7}>
          <Feather name="flag" size={14} color={COLORS.textMuted} />
          <Text style={styles.reportButtonText}>Report Resource</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResourceDetailsScreen;

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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 12,
  },

  // Hero card
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: H_PADDING,
    marginBottom: 16,
    padding: 18,
    ...SHADOW,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 14,
  },
  heroChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  courseBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  courseBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryChip: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  heroDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  heroStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 5,
    fontWeight: '600',
  },
  heroMetaLine: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 10,
  },

  // Uploader
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploaderAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uploaderInitials: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  uploaderInfo: {
    flex: 1,
  },
  uploaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploaderName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  verifiedDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  uploaderMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  // Actions
  actionsWrap: {
    paddingHorizontal: H_PADDING,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconActionButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section header (matches other screens)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Shared list card
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...SHADOW,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Related resources
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  relatedInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  relatedTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  relatedMeta: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  relatedIconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    paddingVertical: 14,
  },
  feedbackTextBlock: {
    flex: 1,
    marginLeft: 12,
  },
  feedbackText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  feedbackMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Report button
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  reportButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 6,
  },
});
