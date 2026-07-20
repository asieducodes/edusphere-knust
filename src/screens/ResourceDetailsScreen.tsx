/**
 * EduSphere — screens/ResourceDetailsScreen.tsx
 * -----------------------------------------------------------------------
 * Opens on top of the bottom tabs when a resource row is tapped anywhere
 * in the app. Receives only a `resourceId` via route params and fetches
 * the real resource (and its related resources/reviews) from the backend
 * — see navigation/types.ts for why this takes an id, not a full object.
 * -----------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Share,
  Linking,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import {
  ScreenHeader,
  SectionCard,
  InfoRow,
  FileTypeBadge,
  PrimaryButton,
  SecondaryButton,
  AppTextInput,
  EmptyState,
  LoadingView,
  ErrorView,
} from '../components/common';
import {
  useResource,
  useResources,
  useResourceReviews,
  useSaveResource,
  useUnsaveResource,
  useDownloadResource,
  useCreateResourceReview,
} from '../hooks/useResources';
import { useCreateReport } from '../hooks/useReports';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourceDetails'>;

function initialsOf(fullName: string): string {
  return fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const ResourceDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { resourceId } = route.params;
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const resourceQuery = useResource(resourceId);
  const resource = resourceQuery.data;

  const relatedQuery = useResources({ courseCode: resource?.courseCode }, !!resource);
  const reviewsQuery = useResourceReviews(resourceId, !!resource);

  const saveMutation = useSaveResource();
  const unsaveMutation = useUnsaveResource();
  const downloadMutation = useDownloadResource();
  const reportMutation = useCreateReport();
  const createReviewMutation = useCreateResourceReview(resourceId);

  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setReviewScore(0);
    setReviewComment('');
    setReviewError(null);
  };

  const handleSubmitReview = () => {
    if (reviewScore < 1) {
      setReviewError(t('resourceDetails.reviewRatingRequired'));
      return;
    }
    setReviewError(null);
    createReviewMutation.mutate(
      { rating: reviewScore, comment: reviewComment.trim() || undefined },
      {
        onSuccess: () => closeReviewModal(),
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          setReviewError(message);
        },
      }
    );
  };

  useFocusEffect(
    useCallback(() => {
      resourceQuery.refetch();
      if (resource) {
        relatedQuery.refetch();
        reviewsQuery.refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!resource])
  );

  const related = (relatedQuery.data?.items ?? []).filter((item) => item.id !== resourceId).slice(0, 5);
  const reviews = reviewsQuery.data?.items ?? [];
  const isSaveSubmitting = saveMutation.isPending || unsaveMutation.isPending;

  const handleShare = () => {
    if (!resource) return;
    Share.share({
      title: resource.title,
      message: t('resourceDetails.shareMessage', { title: resource.title, courseCode: resource.courseCode }),
    }).catch(() => {
      // Share sheet dismissed/cancelled — nothing to do.
    });
  };

  const handleDownload = () => {
    if (!resource) return;
    downloadMutation.mutate(resource.id, {
      onSuccess: (data) => {
        Linking.openURL(data.fileUrl).catch(() => undefined);
      },
      onError: (err) => {
        const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
        Alert.alert(t('resourceDetails.downloadFailed'), message);
      },
    });
  };

  const handleToggleSave = () => {
    if (!resource || isSaveSubmitting) return;
    const mutation = resource.isSaved ? unsaveMutation : saveMutation;
    mutation.mutate(resource.id, {
      onError: (err) => {
        const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
        Alert.alert(t('common.error'), message);
      },
    });
  };

  const handleReport = () => {
    if (!resource) return;
    Alert.alert(t('resourceDetails.reportResource'), t('resourceDetails.reportResourceConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.report'),
        style: 'destructive',
        onPress: () => {
          reportMutation.mutate(
            { targetType: 'resource', targetId: resource.id, reason: t('resourceDetails.reasonInappropriateResource') },
            {
              onSuccess: () => Alert.alert(t('postDetails.reported'), t('resourceDetails.reportedResourceBody')),
              onError: (err) => {
                const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
                Alert.alert(t('common.error'), message);
              },
            }
          );
        },
      },
    ]);
  };

  if (resourceQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <LoadingView message={t('resourceDetails.loading')} />
      </SafeAreaView>
    );
  }

  if (resourceQuery.isError || !resource) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('resourceDetails.title')} onBack={() => navigation.goBack()} />
        <ErrorView message={t('resourceDetails.notFound')} onRetry={() => resourceQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScreenHeader
        title={t('resourceDetails.title')}
        onBack={() => navigation.goBack()}
        rightIcon="more-vertical"
        onPressRight={() =>
          Alert.alert(resource.title, t('resourceDetails.moreActions'), [
            { text: t('common.share'), onPress: handleShare },
            { text: t('common.report'), onPress: handleReport, style: 'destructive' },
            { text: t('common.cancel'), style: 'cancel' },
          ])
        }
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
            <TouchableOpacity
              onPress={handleToggleSave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isSaveSubmitting}
            >
              <Feather name="bookmark" size={19} color={resource.isSaved ? COLORS.primary : COLORS.textMuted} />
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
              <Text style={styles.heroStatText}>{t('resourceDetails.downloads', { count: resource.downloadsCount })}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Feather name="bookmark" size={13} color={COLORS.textSecondary} />
              <Text style={styles.heroStatText}>{t('resourceDetails.saves', { count: resource.savesCount })}</Text>
            </View>
            {resource.rating !== undefined ? (
              <View style={styles.heroStatItem}>
                <Ionicons name="star" size={13} color={COLORS.star} />
                <Text style={styles.heroStatText}>{resource.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.heroMetaLine}>
            {resource.fileType} • {resource.size}
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* UPLOADED BY                                                 */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('resourceDetails.uploadedBy')}>
          <View style={styles.uploaderRow}>
            <View style={styles.uploaderAvatar}>
              <Text style={styles.uploaderInitials}>{initialsOf(resource.uploadedBy.fullName)}</Text>
            </View>
            <View style={styles.uploaderInfo}>
              <Text style={styles.uploaderName}>{resource.uploadedBy.fullName}</Text>
            </View>
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* RESOURCE METADATA                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('resourceDetails.resourceDetailsSection')}>
          <InfoRow icon="file-text" label={t('resourceDetails.fileType')} value={resource.fileType} />
          <InfoRow icon="book-open" label={t('resourceDetails.course')} value={resource.courseCode} />
          <InfoRow icon="tag" label={t('resourceDetails.category')} value={resource.category} />
          <InfoRow icon="hard-drive" label={t('resourceDetails.size')} value={resource.size} />
          <InfoRow icon="eye" label={t('resourceDetails.visibility')} value={resource.visibility} isLast />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* ACTION BUTTONS                                              */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.actionsWrap}>
          <PrimaryButton label={t('resourceDetails.downloadResource')} onPress={handleDownload} icon="download" />
          <View style={{ height: 10 }} />
          <View style={styles.actionsRow}>
            {resource.fileType === 'PDF' && (
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  label={t('resourceDetails.preview')}
                  onPress={() => navigation.navigate('ResourcePreview', { resourceId: resource.id })}
                  icon="eye"
                />
              </View>
            )}
            <TouchableOpacity
              style={styles.iconActionButton}
              activeOpacity={0.85}
              onPress={handleToggleSave}
              disabled={isSaveSubmitting}
            >
              <Feather name="bookmark" size={18} color={resource.isSaved ? COLORS.primary : COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconActionButton} activeOpacity={0.85} onPress={handleShare}>
              <Feather name="share-2" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* RELATED RESOURCES                                           */}
        {/* ---------------------------------------------------------- */}
        {related.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('resourceDetails.relatedResources')}</Text>
            </View>
            <View style={styles.listCard}>
              {related.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.relatedRow, index !== related.length - 1 && styles.rowDivider]}
                  activeOpacity={0.7}
                  onPress={() => navigation.push('ResourceDetails', { resourceId: item.id })}
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
                  <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* STUDENT FEEDBACK                                            */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('resourceDetails.studentFeedback')}</Text>
          {reviews.length > 0 && (
            <TouchableOpacity onPress={() => setReviewModalVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.viewAllText}>{t('resourceDetails.writeReview')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {reviews.length > 0 ? (
          <View style={styles.listCard}>
            {reviews.map((item, index) => (
              <View key={item.id} style={[styles.feedbackRow, index !== reviews.length - 1 && styles.rowDivider]}>
                <Feather name="message-circle" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
                <View style={styles.feedbackTextBlock}>
                  {item.comment ? <Text style={styles.feedbackText}>&ldquo;{item.comment}&rdquo;</Text> : null}
                  <Text style={styles.feedbackMeta}>
                    {t('resourceDetails.ratingBy', { rating: item.rating, name: item.authorName })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listCard}>
            <EmptyState
              icon="message-circle"
              title={t('resourceDetails.noReviewsYet')}
              subtitle={t('resourceDetails.noReviewsYetSubtitle')}
              actionLabel={t('resourceDetails.writeReview')}
              onAction={() => setReviewModalVisible(true)}
            />
          </View>
        )}

        <Modal visible={isReviewModalVisible} transparent animationType="slide" onRequestClose={closeReviewModal}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeReviewModal}>
              <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>{t('resourceDetails.writeReview')}</Text>
                  <TouchableOpacity onPress={closeReviewModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Feather name="x" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setReviewScore(value)}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                      <Feather
                        name="star"
                        size={32}
                        color={value <= reviewScore ? COLORS.star : COLORS.border}
                        style={value < 5 ? { marginRight: 8 } : undefined}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <AppTextInput
                  label={t('resourceDetails.reviewCommentLabel')}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder={t('resourceDetails.reviewCommentPlaceholder')}
                  multiline
                />
                {reviewError ? <Text style={styles.modalErrorText}>{reviewError}</Text> : null}
                <PrimaryButton
                  label={t('resourceDetails.submitReview')}
                  onPress={handleSubmitReview}
                  loading={createReviewMutation.isPending}
                />
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* ---------------------------------------------------------- */}
        {/* REPORT BUTTON                                               */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity style={styles.reportButton} activeOpacity={0.7} onPress={handleReport}>
          <Feather name="flag" size={14} color={COLORS.textMuted} />
          <Text style={styles.reportButtonText}>{t('resourceDetails.reportResource')}</Text>
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

function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
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
  uploaderName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
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

  // Review modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalErrorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: 12,
  },
  starPickerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  });
}
