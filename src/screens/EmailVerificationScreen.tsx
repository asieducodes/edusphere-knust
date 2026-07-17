/**
 * EduSphere — screens/EmailVerificationScreen.tsx
 * -----------------------------------------------------------------------
 * Shown right after signup, before the student can access the app.
 * Reached from SignupScreen (with the entered email as a route param) or
 * from SplashScreen (if the app reopens while a signup is still pending
 * verification — see context/AuthContext.tsx's `pendingEmail`).
 *
 * Rebuilt to match the reference design closely: same logo/background
 * system as Login/Signup/ForgotPassword, plus the "email sent" card,
 * Outlook help box, resend section, and 4-step access guide.
 *
 * INSTALLATION:
 *   npx expo install expo-linear-gradient
 * (@expo/vector-icons is already part of this project.)
 * -----------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FALLBACK_EMAIL = 'student@knust.edu.gh';

// -----------------------------------------------------------------------
// STATIC DATA — the 4-step "how to access your KNUST email" guide
// -----------------------------------------------------------------------
interface AccessStep {
  id: string;
  step: number;
  icon: keyof typeof Feather.glyphMap;
  labelKey: string;
}

const ACCESS_STEPS: AccessStep[] = [
  { id: 'st1', step: 1, icon: 'globe', labelKey: 'emailVerification.step1' },
  { id: 'st2', step: 2, icon: 'user', labelKey: 'emailVerification.step2' },
  { id: 'st3', step: 3, icon: 'lock', labelKey: 'emailVerification.step3' },
  { id: 'st4', step: 4, icon: 'mail', labelKey: 'emailVerification.step4' },
];

const EmailVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { refreshSession } = useAuth();
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  // ---- Small decorative pieces, defined here so they close over this
  // render's styles/COLORS instead of needing them threaded as props. ----
  const GhostIcon: React.FC<{ children: React.ReactNode; style: object }> = ({ children, style }) => (
    <View style={[styles.ghostIcon, style]}>{children}</View>
  );

  const DotGrid: React.FC<{ rows: number; cols: number; style: object }> = ({ rows, cols, style }) => {
    const dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push(<View key={`${r}-${c}`} style={styles.dotGridDot} />);
      }
    }
    return <View style={[styles.dotGridWrap, style, { width: cols * 14 }]}>{dots}</View>;
  };

  /** Same logo emblem used across every auth screen — kept identical so the
   *  brand mark reads as one consistent asset across the app. */
  const LogoEmblem: React.FC = () => (
    <View style={styles.logoWrap}>
      <View style={styles.nodeArc} />
      <View style={[styles.node, styles.nodeTop]} />
      <View style={[styles.node, styles.nodeLeft]} />
      <View style={[styles.node, styles.nodeRight]} />

      <View style={styles.logoCircle}>
        <FontAwesome5 name="graduation-cap" size={38} color={COLORS.primary} style={styles.capIcon} />
        <View style={styles.bookWrap}>
          <Feather name="book-open" size={24} color={COLORS.white} />
        </View>
      </View>
    </View>
  );

  const email = route.params?.email || FALLBACK_EMAIL;
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Real verification happens by clicking the emailed link, not from an
  // in-app button — this re-checks the session every time the student
  // returns to this screen (e.g. after switching to their email app and
  // back), so a verified account moves into the main app automatically
  // (RootNavigator swaps to MainStack once isEmailVerified flips true).
  useFocusEffect(
    useCallback(() => {
      refreshSession();
    }, [refreshSession])
  );

  const handleChange = () => {
    navigation.navigate('Signup');
  };

  const handleOpenOutlook = () => {
    Linking.openURL('https://outlook.office.com');
  };

  const handleResend = async () => {
    if (isResending || resendCooldown) return;

    setIsResending(true);
    setResendError(null);
    try {
      await authService.resendVerification({ email });
      setResendCooldown(true);
      // Simple client-side cooldown so the student can't spam resend.
      setTimeout(() => setResendCooldown(false), 15000);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
      setResendError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleContinueToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      {/* Decorative background layer */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={['rgba(45,63,224,0.16)', 'rgba(45,63,224,0)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.3, y: 0.6 }}
          style={styles.blobTopRight}
        />
        <LinearGradient
          colors={['rgba(45,63,224,0.85)', 'rgba(59,78,240,0.55)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0.8, y: 0.2 }}
          style={styles.blobBottomLeft}
        />

        <DotGrid rows={5} cols={3} style={styles.dotGridTopLeft} />
        <DotGrid rows={5} cols={3} style={styles.dotGridBottomRight} />

        <GhostIcon style={styles.ghostCap}>
          <FontAwesome5 name="graduation-cap" size={30} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBook}>
          <Feather name="book-open" size={30} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostUsers}>
          <Feather name="users" size={32} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostPin}>
          <Feather name="map-pin" size={26} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBuildingLeft}>
          <MaterialCommunityIcons name="office-building-outline" size={30} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBuildingRight}>
          <MaterialCommunityIcons name="bank" size={38} color={COLORS.primary} />
        </GhostIcon>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---------------------------------------------------------- */}
        {/* TOP BRANDING                                                */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.brandingSection}>
          <LogoEmblem />
          <Text style={styles.appName}>EduSphere</Text>
          <Text style={styles.appSubtitle}>{t('splash.tagline')}</Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* VERIFICATION ICON                                           */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.verifyIconOuter}>
          <Feather name="mail" size={34} color={COLORS.primary} />
          <View style={styles.verifyIconCheckBadge}>
            <Feather name="check" size={13} color={COLORS.white} />
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* VERIFICATION HEADING                                        */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.headingSection}>
          <Text style={styles.headingTitle}>{t('emailVerification.verifyYourEmail')}</Text>
          <Text style={styles.headingSubtitle}>
            {t('emailVerification.heading')}
            <Text style={styles.headingSubtitleStrong}>{t('emailVerification.spamFolder')}</Text>
            {t('emailVerification.headingSuffix')}
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* EMAIL SENT CARD                                             */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.card}>
          <View style={styles.emailSentRow}>
            <View style={styles.emailIconWrap}>
              <Feather name="mail" size={17} color={COLORS.primary} />
            </View>
            <View style={styles.emailSentTextBlock}>
              <Text style={styles.emailSentLabel}>{t('emailVerification.emailSentTo')}</Text>
              <Text style={styles.emailSentValue} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <TouchableOpacity onPress={handleChange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.changeLink}>{t('emailVerification.change')}</Text>
            </TouchableOpacity>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* OUTLOOK HELP BOX                                            */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.outlookBox}>
            <View style={styles.outlookBoxTopRow}>
              <Image
                source={require('../../assets/icons/outlook-logo.png')}
                style={styles.outlookLogoImage}
                resizeMode="contain"
              />
              <View style={styles.outlookTextBlock}>
                <Text style={styles.outlookHeading}>{t('emailVerification.outlookHeading')}</Text>
                <Text style={styles.outlookBody}>
                  {t('emailVerification.outlookBody')}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.outlookButton} activeOpacity={0.85} onPress={handleOpenOutlook}>
              <Text style={styles.outlookButtonText}>{t('emailVerification.outlookButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* RESEND VERIFICATION                                         */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.resendSection}>
          <View style={styles.resendRow}>
            <Feather name="clock" size={14} color={COLORS.primary} />
            <Text style={styles.resendText}>{t('emailVerification.haventReceived')}</Text>
          </View>

          {isResending ? (
            <View style={styles.resendLoadingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.resendLoadingText}>{t('emailVerification.sending')}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendCooldown}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.resendLink, resendCooldown && styles.resendLinkDisabled]}>
                {resendCooldown ? t('emailVerification.resendAvailable') : t('emailVerification.resendLink')}
              </Text>
            </TouchableOpacity>
          )}
          {resendError ? <Text style={styles.resendErrorText}>{resendError}</Text> : null}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* HOW TO ACCESS YOUR KNUST EMAIL                              */}
        {/* ---------------------------------------------------------- */}
        <Text style={styles.stepsTitle}>{t('emailVerification.stepsTitle')}</Text>
        <View style={styles.stepsRow}>
          {ACCESS_STEPS.map((item, index) => (
            <React.Fragment key={item.id}>
              <View style={styles.stepItem}>
                <View style={styles.stepIconWrap}>
                  <Feather name={item.icon} size={18} color={COLORS.primary} />
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{item.step}</Text>
                  </View>
                </View>
                <Text style={styles.stepLabel}>{t(item.labelKey)}</Text>
              </View>

              {index !== ACCESS_STEPS.length - 1 && (
                <Feather name="chevron-right" size={16} color={COLORS.textMuted} style={styles.stepChevron} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* CONTINUE TO LOGIN + TRUST BADGE                             */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.loginSection}>
          <Text style={styles.loginSectionLabel}>{t('emailVerification.alreadyVerified')}</Text>
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.85} onPress={handleContinueToLogin}>
            <Text style={styles.loginButtonText}>{t('emailVerification.continueToLogin')}</Text>
            <Feather name="arrow-right" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.trustBadgeRow}>
          <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
          <Text style={styles.trustBadgeText}>{t('emailVerification.trustBadge')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmailVerificationScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const LOGO_SIZE = 96;
const H_PADDING = 24;

function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // ---------------- Decorative background ----------------
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blobTopRight: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.25,
    right: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.42,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.32,
    left: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    borderRadius: SCREEN_WIDTH * 0.48,
  },
  dotGridWrap: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dotGridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(45,63,224,0.18)',
    margin: 5,
  },
  dotGridTopLeft: {
    top: 100,
    left: 20,
  },
  dotGridBottomRight: {
    bottom: 200,
    right: 24,
  },
  ghostIcon: {
    position: 'absolute',
    opacity: 0.07,
  },
  ghostCap: {
    top: '3%',
    left: '12%',
  },
  ghostBook: {
    top: '1%',
    left: '2%',
  },
  ghostUsers: {
    top: '4%',
    right: '8%',
  },
  ghostPin: {
    top: '18%',
    right: '4%',
  },
  ghostBuildingLeft: {
    top: '9%',
    left: '1%',
  },
  ghostBuildingRight: {
    top: '9%',
    right: '1%',
  },

  // ---------------- Branding section ----------------
  brandingSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: H_PADDING,
  },
  logoWrap: {
    width: LOGO_SIZE + 28,
    height: LOGO_SIZE + 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  capIcon: {
    marginTop: -3,
  },
  bookWrap: {
    position: 'absolute',
    bottom: -10,
    width: 38,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  nodeArc: {
    position: 'absolute',
    top: 3,
    width: LOGO_SIZE - 12,
    height: LOGO_SIZE - 12,
    borderRadius: (LOGO_SIZE - 12) / 2,
    borderWidth: 1.5,
    borderColor: COLORS.primarySoft,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-35deg' }],
  },
  node: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  nodeTop: {
    top: 0,
    alignSelf: 'center',
  },
  nodeLeft: {
    top: 13,
    left: 15,
  },
  nodeRight: {
    top: 13,
    right: 15,
  },
  appName: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ---------------- Verification icon ----------------
  verifyIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 22,
  },
  verifyIconCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBFCFE',
  },

  // ---------------- Heading section ----------------
  headingSection: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 22,
    paddingHorizontal: H_PADDING + 4,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  headingSubtitle: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  headingSubtitleStrong: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // ---------------- Email sent card ----------------
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginHorizontal: H_PADDING,
    padding: 18,
    ...SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  emailSentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emailSentTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  emailSentLabel: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  emailSentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ---------------- Outlook help box ----------------
  outlookBox: {
    backgroundColor: '#F5F7FD',
    borderRadius: 18,
    padding: 16,
  },
  outlookBoxTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  outlookLogoImage: {
    width: 58,
    height: 54, // preserves the logo's real 256x239 aspect ratio at this width
    marginRight: 14,
  },
  outlookTextBlock: {
    flex: 1,
  },
  outlookHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 5,
  },
  outlookBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  outlookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  outlookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ---------------- Resend section ----------------
  resendSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 26,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  resendLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendLinkDisabled: {
    color: COLORS.textMuted,
  },
  resendLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLoadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  resendErrorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 8,
    textAlign: 'center',
  },

  // ---------------- Steps ----------------
  stepsTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  stepItem: {
    alignItems: 'center',
    width: 74,
  },
  stepIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepNumberBadge: {
    position: 'absolute',
    bottom: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBFCFE',
  },
  stepNumberText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  stepChevron: {
    marginTop: 16,
  },

  // ---------------- Continue to login + trust badge ----------------
  loginSection: {
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    marginBottom: 4,
  },
  loginSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  trustBadgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  });
}
