/**
 * EduSphere — screens/SettingsScreen.tsx
 * -----------------------------------------------------------------------
 * Appearance (Light/Dark/System) and Language (English/Français/Español)
 * — both real and persisted, driving useTheme()/useLanguage() app-wide.
 * Reached from ProfileScreen's header gear icon, which used to just show
 * "Settings aren't available yet."
 *
 * Account-level things (privacy toggles, logout) already live in
 * EditProfileScreen/ProfileScreen — kept there rather than duplicated
 * here, so Settings stays focused on the two things actually requested:
 * appearance and language, plus a minimal About block.
 * -----------------------------------------------------------------------
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SHADOW, ThemeColors, ACCENT_COLORS, getColors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage, Language, LANGUAGE_LABELS } from '../context/LanguageContext';
import { useDeleteAccount } from '../hooks/useProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const APP_VERSION = '1.0.0'; // keep in sync with app.json's "version"

const THEME_OPTIONS: { mode: ThemeMode; icon: keyof typeof Feather.glyphMap }[] = [
  { mode: 'light', icon: 'sun' },
  { mode: 'dark', icon: 'moon' },
  { mode: 'system', icon: 'smartphone' },
];

const LANGUAGE_OPTIONS: Language[] = ['en', 'fr', 'es'];

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { mode, setMode, colors: COLORS, isDark, accent, setAccent } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
  const deleteAccountMutation = useDeleteAccount();

  const handleDeleteAccount = () => {
    Alert.alert(t('settings.deleteAccountConfirmTitle'), t('settings.deleteAccountConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteAccountConfirmButton'),
        style: 'destructive',
        onPress: () => {
          deleteAccountMutation.mutate(undefined, {
            onError: (err) => {
              const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
              Alert.alert(t('settings.deleteAccountFailedTitle'), message);
            },
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerIconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ---------------------------------------------------------- */}
        {/* APPEARANCE                                                  */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        <View style={styles.card}>
          {THEME_OPTIONS.map((option, index) => {
            const selected = mode === option.mode;
            return (
              <TouchableOpacity
                key={option.mode}
                style={[styles.row, index !== THEME_OPTIONS.length - 1 && styles.rowDivider]}
                activeOpacity={0.7}
                onPress={() => setMode(option.mode)}
              >
                <View style={styles.rowIconWrap}>
                  <Feather name={option.icon} size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.rowLabel}>{t(`settings.theme.${option.mode}`)}</Text>
                {selected ? <Feather name="check" size={18} color={COLORS.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* ACCENT COLOR                                                */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('settings.accentColor')}</Text>
        <View style={[styles.card, styles.accentCard]}>
          {ACCENT_COLORS.map((option) => {
            const swatchColor = getColors(isDark, option).primary;
            const selected = accent === option;
            return (
              <TouchableOpacity
                key={option}
                style={styles.accentSwatchWrap}
                activeOpacity={0.8}
                onPress={() => setAccent(option)}
              >
                <View style={[styles.accentSwatch, { backgroundColor: swatchColor }, selected && styles.accentSwatchSelected]}>
                  {selected ? <Feather name="check" size={18} color={COLORS.white} /> : null}
                </View>
                <Text style={styles.accentSwatchLabel}>{t(`settings.color.${option}`)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* LANGUAGE                                                    */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.card}>
          {LANGUAGE_OPTIONS.map((option, index) => {
            const selected = language === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.row, index !== LANGUAGE_OPTIONS.length - 1 && styles.rowDivider]}
                activeOpacity={0.7}
                onPress={() => setLanguage(option)}
              >
                <View style={styles.rowIconWrap}>
                  <Feather name="globe" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.rowLabel}>{LANGUAGE_LABELS[option]}</Text>
                {selected ? <Feather name="check" size={18} color={COLORS.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* ABOUT                                                       */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Feather name="info" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.rowLabel}>EduSphere</Text>
            <Text style={styles.versionText}>v{APP_VERSION}</Text>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* DANGER ZONE                                                 */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('settings.dangerZone')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
          >
            <View style={styles.dangerIconWrap}>
              <Feather name="trash-2" size={16} color={COLORS.danger} />
            </View>
            <Text style={styles.dangerRowLabel}>
              {deleteAccountMutation.isPending ? t('settings.deletingAccount') : t('settings.deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

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
    },
    sectionTitle: {
      fontSize: 13.5,
      fontWeight: '700',
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginHorizontal: H_PADDING,
      marginTop: 22,
      marginBottom: 10,
    },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      marginHorizontal: H_PADDING,
      paddingHorizontal: 16,
      ...SHADOW,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
    },
    accentCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    accentSwatchWrap: {
      alignItems: 'center',
    },
    accentSwatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accentSwatchSelected: {
      borderWidth: 2,
      borderColor: COLORS.textPrimary,
    },
    accentSwatchLabel: {
      fontSize: 11.5,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginTop: 8,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    rowIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textPrimary,
    },
    versionText: {
      fontSize: 13,
      color: COLORS.textMuted,
    },
    dangerIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: COLORS.danger + '1A',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    dangerRowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.danger,
    },
  });
}
