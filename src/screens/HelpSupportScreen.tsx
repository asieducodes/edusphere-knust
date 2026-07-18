/**
 * EduSphere — screens/HelpSupportScreen.tsx
 * -----------------------------------------------------------------------
 * FAQ accordion (static content — no backend, nothing to fetch) plus a
 * real "Contact us" action that opens the device's mail app addressed to
 * the project's support inbox. Reached from ProfileScreen's account menu.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SHADOW, ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const SUPPORT_EMAIL = 'edusphere.knust@gmail.com';

const FAQ_KEYS = ['joinGroup', 'uploadResource', 'knustEmail', 'liveCall', 'languageTheme', 'deleteAccount'] as const;

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleContactUs = () => {
    const subject = encodeURIComponent(t('helpSupport.emailSubject'));
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`).catch(() => {
      Alert.alert(t('helpSupport.noMailAppTitle'), t('helpSupport.noMailAppBody', { email: SUPPORT_EMAIL }));
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpSupport.title')}</Text>
        <View style={styles.headerIconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ---------------------------------------------------------- */}
        {/* FAQ                                                         */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('helpSupport.faqTitle')}</Text>
        <View style={styles.card}>
          {FAQ_KEYS.map((key, index) => {
            const isExpanded = expandedKey === key;
            return (
              <View key={key} style={index !== FAQ_KEYS.length - 1 ? styles.rowDivider : undefined}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  activeOpacity={0.7}
                  onPress={() => setExpandedKey(isExpanded ? null : key)}
                >
                  <Text style={styles.faqQuestionText}>{t(`helpSupport.faq.${key}.question`)}</Text>
                  <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
                {isExpanded ? (
                  <Text style={styles.faqAnswerText}>{t(`helpSupport.faq.${key}.answer`)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* CONTACT                                                     */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>{t('helpSupport.contactTitle')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handleContactUs}>
            <View style={styles.rowIconWrap}>
              <Feather name="mail" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.contactTextBlock}>
              <Text style={styles.rowLabel}>{t('helpSupport.contactUs')}</Text>
              <Text style={styles.contactSubtitle}>{SUPPORT_EMAIL}</Text>
            </View>
            <Feather name="external-link" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

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
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    faqQuestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textPrimary,
      marginRight: 12,
    },
    faqAnswerText: {
      fontSize: 13,
      color: COLORS.textSecondary,
      lineHeight: 19,
      paddingBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
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
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textPrimary,
    },
    contactTextBlock: {
      flex: 1,
    },
    contactSubtitle: {
      fontSize: 12,
      color: COLORS.textMuted,
      marginTop: 2,
    },
  });
}
