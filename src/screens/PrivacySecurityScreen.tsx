/**
 * EduSphere — screens/PrivacySecurityScreen.tsx
 * -----------------------------------------------------------------------
 * Privacy toggles (moved here from EditProfileScreen — one home for "who
 * can see/contact me" settings, matching Change Password living right
 * next to it) plus a real change-password form backed by
 * POST /profile/change-password. Reached from ProfileScreen's account
 * menu.
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SHADOW, ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { SectionCard, ToggleRow, AppTextInput, PrimaryButton, LoadingView, ErrorView } from '../components/common';
import { useMyProfile, useUpdateProfile, useChangePassword } from '../hooks/useProfile';
import { UserPrivacySettings } from '../types/user';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacySecurity'>;

const PrivacySecurityScreen: React.FC<Props> = ({ navigation }) => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const profileQuery = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [privacy, setPrivacy] = useState<UserPrivacySettings>({
    showProfile: true,
    allowGroupInvitations: true,
    allowDirectStudyRequests: false,
  });

  useEffect(() => {
    if (!profileQuery.data?.privacy) return;
    setPrivacy(profileQuery.data.privacy);
  }, [profileQuery.data]);

  const handleTogglePrivacy = (key: keyof UserPrivacySettings, value: boolean) => {
    const previous = privacy[key];
    setPrivacy((prev) => ({ ...prev, [key]: value }));
    updateProfileMutation.mutate(
      { privacy: { [key]: value } },
      {
        onError: (err) => {
          setPrivacy((prev) => ({ ...prev, [key]: previous }));
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          Alert.alert(t('privacySecurity.updateFailedTitle'), message);
        },
      }
    );
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const newPasswordError =
    submitted && newPassword.length > 0 && newPassword.length < 8
      ? t('privacySecurity.passwordTooShort')
      : undefined;
  const confirmPasswordError =
    submitted && confirmPassword.length > 0 && confirmPassword !== newPassword
      ? t('privacySecurity.passwordsDontMatch')
      : undefined;

  const handleChangePassword = () => {
    setSubmitted(true);
    setPasswordError(null);
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) return;

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setSubmitted(false);
          Alert.alert(t('privacySecurity.passwordChangedTitle'), t('privacySecurity.passwordChangedBody'));
        },
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          setPasswordError(message);
        },
      }
    );
  };

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('privacySecurity.title')}</Text>
          <View style={styles.headerIconButton} />
        </View>
        <LoadingView message={t('privacySecurity.loading')} />
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('privacySecurity.title')}</Text>
          <View style={styles.headerIconButton} />
        </View>
        <ErrorView onRetry={() => profileQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacySecurity.title')}</Text>
        <View style={styles.headerIconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ---------------------------------------------------------- */}
        {/* PRIVACY                                                     */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('privacySecurity.privacy')}>
          <ToggleRow
            icon="eye"
            label={t('privacySecurity.showProfile')}
            value={privacy.showProfile}
            onValueChange={(v) => handleTogglePrivacy('showProfile', v)}
          />
          <ToggleRow
            icon="user-plus"
            label={t('privacySecurity.allowInvitations')}
            value={privacy.allowGroupInvitations}
            onValueChange={(v) => handleTogglePrivacy('allowGroupInvitations', v)}
          />
          <ToggleRow
            icon="message-circle"
            label={t('privacySecurity.allowStudyRequests')}
            value={privacy.allowDirectStudyRequests}
            onValueChange={(v) => handleTogglePrivacy('allowDirectStudyRequests', v)}
            isLast
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* CHANGE PASSWORD                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('privacySecurity.changePassword')} style={{ marginTop: 20 }}>
          <AppTextInput
            label={t('privacySecurity.currentPasswordLabel')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <AppTextInput
            label={t('privacySecurity.newPasswordLabel')}
            value={newPassword}
            onChangeText={setNewPassword}
            error={newPasswordError}
            secureTextEntry
            autoCapitalize="none"
          />
          <AppTextInput
            label={t('privacySecurity.confirmPasswordLabel')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPasswordError}
            secureTextEntry
            autoCapitalize="none"
            style={{ marginBottom: 0 }}
          />
          {passwordError ? (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={12} color={COLORS.danger} />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label={t('privacySecurity.changePasswordButton')}
              onPress={handleChangePassword}
              loading={changePasswordMutation.isPending}
            />
          </View>
        </SectionCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySecurityScreen;

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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: H_PADDING,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW,
    },
    headerTitle: {
      fontSize: 16.5,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    scrollContent: {
      paddingTop: 8,
      paddingBottom: 12,
      paddingHorizontal: H_PADDING,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 4,
    },
    errorText: {
      fontSize: 12,
      color: COLORS.danger,
      marginLeft: 6,
    },
  });
}
