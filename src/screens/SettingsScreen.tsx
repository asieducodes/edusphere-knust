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
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SHADOW, ThemeColors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage, Language, LANGUAGE_LABELS } from '../context/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const APP_VERSION = '1.0.0'; // keep in sync with app.json's "version"

const THEME_OPTIONS: { mode: ThemeMode; icon: keyof typeof Feather.glyphMap }[] = [
  { mode: 'light', icon: 'sun' },
  { mode: 'dark', icon: 'moon' },
  { mode: 'system', icon: 'smartphone' },
];

const LANGUAGE_OPTIONS: Language[] = ['en', 'fr', 'es'];

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { mode, setMode, colors: COLORS, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

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
  });
}
