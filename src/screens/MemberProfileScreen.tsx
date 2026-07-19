/**
 * EduSphere — screens/MemberProfileScreen.tsx
 * -----------------------------------------------------------------------
 * Another student's public profile, reached by tapping a member in
 * GroupDetailsScreen's member list. Read-only, plus a "Rate Student"
 * action — same star-picker pattern as GroupDetailsScreen's Rate Group.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, SectionCard, InfoRow, PrimaryButton, AppTextInput, LoadingView, ErrorView } from '../components/common';
import { useUserProfile } from '../hooks/useUsers';
import { useCreateRating } from '../hooks/useRatings';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberProfile'>;

const MemberProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
  const { user: viewer } = useAuth();

  const profileQuery = useUserProfile(userId);
  const rateMutation = useCreateRating();

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const profile = profileQuery.data;
  const isOwnProfile = viewer?.id === userId;

  const closeModal = () => {
    setRatingModalVisible(false);
    setModalError(null);
  };

  const handleSubmitRating = () => {
    if (ratingScore < 1) {
      setModalError(t('memberProfile.ratingRequired'));
      return;
    }
    setModalError(null);
    rateMutation.mutate(
      { targetType: 'user', targetId: userId, score: ratingScore, comment: ratingComment.trim() || undefined },
      {
        onSuccess: () => {
          setRatingScore(0);
          setRatingComment('');
          closeModal();
          profileQuery.refetch();
        },
        onError: (err) => setModalError((err as { message?: string })?.message ?? t('common.somethingWentWrong')),
      }
    );
  };

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('memberProfile.title')} onBack={() => navigation.goBack()} />
        <LoadingView message={t('memberProfile.loading')} />
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profile) {
    const status = (profileQuery.error as { statusCode?: number })?.statusCode;
    const message = status === 403 ? t('memberProfile.profilePrivate') : undefined;
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('memberProfile.title')} onBack={() => navigation.goBack()} />
        <ErrorView message={message} onRetry={status === 403 ? undefined : () => profileQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
      <ScreenHeader title={t('memberProfile.title')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={30} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.name}>{profile.fullName}</Text>
          {profile.programme ? <Text style={styles.programme}>{profile.programme}</Text> : null}
          <View style={styles.metaRow}>
            {profile.level ? (
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{profile.level}</Text>
              </View>
            ) : null}
            {profile.rating !== undefined ? (
              <View style={styles.ratingBadge}>
                <Feather name="star" size={12} color={COLORS.star} />
                <Text style={styles.ratingBadgeText}>{profile.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {profile.bio ? (
          <SectionCard title={t('memberProfile.about')}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </SectionCard>
        ) : null}

        <SectionCard title={t('memberProfile.academicInformation')}>
          <InfoRow icon="book-open" label={t('memberProfile.programme')} value={profile.programme || t('memberProfile.notSet')} />
          <InfoRow icon="layers" label={t('memberProfile.department')} value={profile.department || t('memberProfile.notSet')} />
          <InfoRow icon="home" label={t('memberProfile.college')} value={profile.college || t('memberProfile.notSet')} />
          <InfoRow icon="bar-chart-2" label={t('memberProfile.level')} value={profile.level || t('memberProfile.notSet')} isLast />
        </SectionCard>

        {profile.interests.length > 0 && (
          <SectionCard title={t('memberProfile.studyInterests')}>
            <View style={styles.chipsWrap}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {profile.skills.length > 0 && (
          <SectionCard title={t('memberProfile.skills')}>
            <View style={styles.chipsWrap}>
              {profile.skills.map((skill) => (
                <View key={skill} style={styles.chip}>
                  <Text style={styles.chipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {profile.availability.length > 0 && (
          <SectionCard title={t('memberProfile.availability')}>
            <View style={styles.chipsWrap}>
              {profile.availability.map((slot) => (
                <View key={slot} style={styles.chip}>
                  <Text style={styles.chipText}>{slot}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {!isOwnProfile && (
          <View style={styles.rateButtonWrap}>
            <PrimaryButton
              label={t('memberProfile.rateStudent')}
              icon="star"
              onPress={() => setRatingModalVisible(true)}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {ratingModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('memberProfile.rateStudent')}</Text>
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRatingScore(value)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Feather
                    name="star"
                    size={32}
                    color={value <= ratingScore ? COLORS.star : COLORS.border}
                    style={value < 5 ? { marginRight: 8 } : undefined}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <AppTextInput
              label={t('memberProfile.ratingCommentLabel')}
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder={t('memberProfile.ratingCommentPlaceholder')}
              multiline
            />
            {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}
            <PrimaryButton label={t('memberProfile.submitRating')} onPress={handleSubmitRating} loading={rateMutation.isPending} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MemberProfileScreen;

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
    },
    scrollContent: {
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerCard: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      marginBottom: 12,
      borderWidth: 3,
      borderColor: COLORS.primaryLight,
    },
    avatarPlaceholder: {
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      fontSize: 19,
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: 4,
      textAlign: 'center',
    },
    programme: {
      fontSize: 13.5,
      color: COLORS.textSecondary,
      marginBottom: 10,
      textAlign: 'center',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    levelBadge: {
      backgroundColor: COLORS.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    levelBadgeText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: COLORS.primary,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.warningLight,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    ratingBadgeText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: COLORS.warning,
      marginLeft: 4,
    },
    bioText: {
      fontSize: 13.5,
      lineHeight: 20,
      color: COLORS.textSecondary,
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      backgroundColor: COLORS.chipBg,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginRight: 8,
      marginBottom: 8,
    },
    chipText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: COLORS.textPrimary,
    },
    rateButtonWrap: {
      paddingHorizontal: H_PADDING,
      marginTop: 8,
    },

    // ---------------- Rating modal ----------------
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(17,17,17,0.4)',
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
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 14,
    },
    starPickerRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    modalErrorText: {
      fontSize: 12,
      color: COLORS.danger,
      marginBottom: 12,
    },
  });
}
