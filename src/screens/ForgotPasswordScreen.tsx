/**
 * EduSphere — screens/ForgotPasswordScreen.tsx
 * -----------------------------------------------------------------------
 * Password reset request screen. Reached from LoginScreen's "Forgot
 * Password?" link. Shares the same logo, background decoration, and
 * form-field styling as LoginScreen.tsx / SignupScreen.tsx / SplashScreen.tsx.
 *
 * INSTALLATION:
 *   npx expo install expo-linear-gradient
 * (@expo/vector-icons is already part of this project.)
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';
import { validateForgotPasswordForm } from '../utils/authValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -----------------------------------------------------------------------
// SMALL DECORATIVE PIECES (same approach as Login/Signup)
// -----------------------------------------------------------------------
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

/** Same logo emblem used across Splash/Login/Signup — kept identical so
 *  the brand mark reads as one consistent asset across the app. */
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

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const emailError = submitted ? validateForgotPasswordForm(email).errors.email : undefined;

  const handleSendResetLink = () => {
    setSubmitted(true);
    const { isValid } = validateForgotPasswordForm(email);

    // Placeholder — replace with a real "send reset email" API call.
    console.log('Send reset link pressed', { email });

    if (!isValid) {
      setLinkSent(false);
      return; // Do not proceed, and do not call any backend placeholder.
    }

    setLinkSent(true);
  };

  const handleLogInPress = () => {
    navigation.navigate('Login');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
          <Feather name="book-open" size={28} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostUsers}>
          <Feather name="users" size={32} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostPin}>
          <Feather name="map-pin" size={28} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBuildingLeft}>
          <MaterialCommunityIcons name="office-building-outline" size={32} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBuildingRight}>
          <MaterialCommunityIcons name="bank" size={40} color={COLORS.primary} />
        </GhostIcon>
      </View>

      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={handleBackPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-left" size={26} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
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
            <Text style={styles.appSubtitle}>Campus Study Group & Resource Finder</Text>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* FORGOT PASSWORD HEADING                                     */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.headingSection}>
            <Text style={styles.headingTitle}>Forgot Password?</Text>
            <Text style={styles.headingSubtitle}>No worries! We&apos;ll help you reset it.</Text>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* RESET PASSWORD FORM CARD                                    */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.formCard}>
            {/* Reset icon area */}
            <View style={styles.resetIconOuter}>
              <Feather name="mail" size={30} color={COLORS.primary} />
              <View style={styles.resetIconLockBadge}>
                <Feather name="lock" size={12} color={COLORS.white} />
              </View>
            </View>

            <Text style={styles.cardTitle}>Reset your password</Text>
            <Text style={styles.cardInstruction}>
              Enter your KNUST email address and we&apos;ll send you a link to reset your password.
            </Text>

            {/* KNUST Email */}
            <Text style={styles.fieldLabel}>KNUST Email</Text>
            <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
              <Feather name="mail" size={17} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="student@knust.edu.gh"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (linkSent) setLinkSent(false);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            {emailError ? (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={12} color={COLORS.danger} />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            ) : (
              <View style={styles.helperRow}>
                <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
                <Text style={styles.helperText}>KNUST students only</Text>
              </View>
            )}

            {/* Success message, shown after a valid submit */}
            {linkSent && (
              <View style={styles.successRow}>
                <Feather name="check-circle" size={15} color={COLORS.success} />
                <Text style={styles.successText}>Password reset link sent. Please check your email.</Text>
              </View>
            )}

            {/* Send Reset Link button */}
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={handleSendResetLink}>
              <Text style={styles.sendButtonText}>Send Reset Link</Text>
            </TouchableOpacity>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* LOG IN + TRUST BADGE                                        */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.loginRow}>
            <Text style={styles.loginRowText}>Remember your password? </Text>
            <TouchableOpacity onPress={handleLogInPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.loginRowLink}>Log In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustBadgeRow}>
            <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
            <Text style={styles.trustBadgeText}>Verified KNUST access</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const LOGO_SIZE = 96;
const H_PADDING = 24;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFCFE',
  },
  scrollContent: {
    paddingBottom: 40,
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
    top: 110,
    left: 24,
  },
  dotGridBottomRight: {
    bottom: 130,
    right: 24,
  },
  ghostIcon: {
    position: 'absolute',
    opacity: 0.07,
  },
  ghostCap: {
    top: '5%',
    left: '24%',
  },
  ghostBook: {
    top: '5%',
    left: '8%',
  },
  ghostUsers: {
    top: '5%',
    right: '10%',
  },
  ghostPin: {
    top: '9%',
    right: '3%',
  },
  ghostBuildingLeft: {
    top: '18%',
    left: '2%',
  },
  ghostBuildingRight: {
    top: '18%',
    right: '2%',
  },

  // ---------------- Back button ----------------
  backButton: {
    position: 'absolute',
    top: 14,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---------------- Branding section ----------------
  brandingSection: {
    alignItems: 'center',
    paddingTop: 44,
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

  // ---------------- Heading section ----------------
  headingSection: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
    paddingHorizontal: H_PADDING,
  },
  headingTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ---------------- Form card ----------------
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    marginHorizontal: H_PADDING,
    padding: 22,
    alignItems: 'center',
    ...SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  resetIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resetIconLockBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardInstruction: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 4,
  },

  // Form fields — full width within the card
  fieldLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 9,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 5,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
    lineHeight: 17,
  },

  // Send Reset Link button
  sendButton: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ---------------- Log in + trust badge ----------------
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginRowText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
  },
  loginRowLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
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
