/**
 * EduSphere — screens/SignupScreen.tsx
 * -----------------------------------------------------------------------
 * Account creation screen. Reached from LoginScreen's "Sign Up" link.
 * Shares the same logo, background-decoration approach, and form-field
 * styling as LoginScreen.tsx / SplashScreen.tsx for visual consistency.
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
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthStackParamList } from '../navigation/types';
import { validateSignupForm } from '../utils/authValidation';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../hooks/useCourses';
import { PROGRAMME_OPTIONS, LEVEL_OPTIONS, PROGRAMME_TO_DEPARTMENT } from '../constants/academic';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PickerField = 'programme' | 'level';

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  // ---- Small decorative + form pieces, defined here so they close over
  // this render's styles/COLORS instead of needing them threaded as props.
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

  /** Same logo emblem as LoginScreen.tsx / SplashScreen.tsx, kept identical
   *  so the brand mark reads as one consistent asset across the app. */
  const LogoEmblem: React.FC = () => (
    <View style={styles.logoWrap}>
      <View style={styles.nodeArc} />
      <View style={[styles.node, styles.nodeTop]} />
      <View style={[styles.node, styles.nodeLeft]} />
      <View style={[styles.node, styles.nodeRight]} />

      <View style={styles.logoCircle}>
        <FontAwesome5 name="graduation-cap" size={40} color={COLORS.primary} style={styles.capIcon} />
        <View style={styles.bookWrap}>
          <Feather name="book-open" size={26} color={COLORS.white} />
        </View>
      </View>
    </View>
  );

  /** A pressable row styled to look like a dropdown/select input. Opens the
   *  shared picker modal rather than a native <Picker> — keeps styling
   *  fully under our control and consistent with the other text inputs. */
  const DropdownField: React.FC<{
    icon: keyof typeof Feather.glyphMap;
    value: string;
    placeholder: string;
    error?: string;
    onPress: () => void;
    style?: object;
  }> = ({ icon, value, placeholder, error, onPress, style }) => (
    <TouchableOpacity
      style={[styles.inputWrapper, error && styles.inputWrapperError, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Feather name={icon} size={17} color={COLORS.textMuted} />
      <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Feather name="chevron-down" size={17} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  /** Non-interactive display row, styled to match DropdownField, for
   *  values the student can't set directly (department is derived from
   *  the chosen programme, never picked on its own). */
  const ReadOnlyField: React.FC<{
    icon: keyof typeof Feather.glyphMap;
    value: string;
    placeholder: string;
  }> = ({ icon, value, placeholder }) => (
    <View style={[styles.inputWrapper, styles.inputWrapperReadOnly]}>
      <Feather name={icon} size={17} color={COLORS.textMuted} />
      <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]} numberOfLines={1}>
        {value || placeholder}
      </Text>
    </View>
  );

  /** Small shared error text row, used under every field in this form. */
  const ErrorText: React.FC<{ text: string }> = ({ text }) => (
    <View style={styles.errorRow}>
      <Feather name="alert-circle" size={12} color={COLORS.danger} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [programme, setProgramme] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [level, setLevel] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [activePicker, setActivePicker] = useState<PickerField | null>(null);

  const departmentsQuery = useDepartments();
  const departments = departmentsQuery.data?.items ?? [];
  const isLoadingDepartments = departmentsQuery.isLoading;

  // ---- Validation (only shown after first submit attempt) -----------
  const { errors } = submitted
    ? validateSignupForm({ fullName, email, programme, department, level, password, confirmPassword })
    : { errors: {} as Record<string, string> };

  const handleCreateAccount = async () => {
    setSubmitted(true);
    setServerError(null);
    const { isValid } = validateSignupForm({
      fullName,
      email,
      programme,
      department,
      level,
      password,
      confirmPassword,
    });

    if (!isValid || !departmentId) {
      if (isValid && !departmentId) setServerError(t('signup.departmentMissing'));
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName, email, password, programme, departmentId, level });
      navigation.navigate('EmailVerification', { email });
    } catch (err) {
      const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogInPress = () => {
    navigation.replace('Login');
  };

  const openPicker = (field: PickerField) => setActivePicker(field);
  const closePicker = () => setActivePicker(null);

  const pickerOptions =
    activePicker === 'programme'
      ? PROGRAMME_OPTIONS
      : activePicker === 'level'
      ? LEVEL_OPTIONS
      : [];

  const handleSelectOption = (option: string) => {
    if (activePicker === 'programme') {
      setProgramme(option);
      // department follows programme now, not pickable on its own —
      // stops students from picking a mismatched department
      const matchedDeptName = PROGRAMME_TO_DEPARTMENT[option];
      const matchedDept = matchedDeptName ? departments.find((d) => d.name === matchedDeptName) : undefined;
      setDepartment(matchedDept?.name ?? '');
      setDepartmentId(matchedDept?.id ?? '');
    }
    if (activePicker === 'level') setLevel(option);
    closePicker();
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
          <FontAwesome5 name="graduation-cap" size={34} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBook}>
          <Feather name="book-open" size={30} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostUsers}>
          <Feather name="users" size={34} color={COLORS.primary} />
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
            <Text style={styles.appSubtitle}>{t('splash.tagline')}</Text>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* SIGNUP HEADING                                              */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.headingSection}>
            <Text style={styles.headingTitle}>{t('signup.createAccount')}</Text>
            <Text style={styles.headingSubtitle}>{t('signup.subtitle')}</Text>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* SIGNUP FORM CARD                                            */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.formCard}>
            {/* Full Name */}
            <Text style={styles.fieldLabel}>{t('signup.fullNameLabel')}</Text>
            <View style={[styles.inputWrapper, errors.fullName && styles.inputWrapperError]}>
              <Feather name="user" size={17} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={t('signup.fullNamePlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
            {errors.fullName ? <ErrorText text={errors.fullName} /> : null}

            {/* KNUST Email */}
            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>{t('signup.emailLabel')}</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
              <Feather name="mail" size={17} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="student@knust.edu.gh"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            {errors.email ? (
              <ErrorText text={errors.email} />
            ) : (
              <View style={styles.helperRow}>
                <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
                <Text style={styles.helperText}>{t('signup.knustOnly')}</Text>
              </View>
            )}

            {/* Programme */}
            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>{t('signup.programmeLabel')}</Text>
            <DropdownField
              icon="award"
              value={programme}
              placeholder={t('signup.programmePlaceholder')}
              error={errors.programme}
              onPress={() => openPicker('programme')}
            />
            {errors.programme ? <ErrorText text={errors.programme} /> : null}

            {/* Department + Level, side by side */}
            <View style={styles.rowFields}>
              <View style={styles.rowFieldHalf}>
                <Text style={styles.fieldLabel}>{t('signup.departmentLabel')}</Text>
                <ReadOnlyField
                  icon="home"
                  value={department}
                  placeholder={isLoadingDepartments ? t('signup.loading') : t('signup.departmentAutoPlaceholder')}
                />
                {errors.department ? <ErrorText text={errors.department} /> : null}
              </View>

              <View style={[styles.rowFieldHalf, { marginLeft: 12 }]}>
                <Text style={styles.fieldLabel}>{t('signup.levelLabel')}</Text>
                <DropdownField
                  icon="bar-chart-2"
                  value={level}
                  placeholder={t('signup.levelPlaceholder')}
                  error={errors.level}
                  onPress={() => openPicker('level')}
                />
                {errors.level ? <ErrorText text={errors.level} /> : null}
              </View>
            </View>

            {/* Password */}
            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>{t('signup.passwordLabel')}</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
              <Feather name="lock" size={17} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={t('signup.passwordPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={17} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password ? <ErrorText text={errors.password} /> : null}

            {/* Confirm Password */}
            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>{t('signup.confirmPasswordLabel')}</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
              <Feather name="lock" size={17} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={t('signup.confirmPasswordPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={17} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <ErrorText text={errors.confirmPassword} /> : null}

            {serverError ? <ErrorText text={serverError} /> : null}

            {/* Create Account button */}
            <TouchableOpacity
              style={[styles.createAccountButton, isSubmitting && styles.createAccountButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleCreateAccount}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.createAccountButtonText}>{t('signup.createAccountButton')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* LOG IN + TRUST BADGE                                        */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.loginRow}>
            <Text style={styles.loginRowText}>{t('signup.haveAccount')}</Text>
            <TouchableOpacity onPress={handleLogInPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.loginRowLink}>{t('signup.logIn')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustBadgeRow}>
            <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
            <Text style={styles.trustBadgeText}>{t('signup.trustBadge')}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------------------------------------------------------- */}
      {/* PICKER MODAL — shared by Programme / Level                   */}
      {/* ---------------------------------------------------------- */}
      <Modal visible={activePicker !== null} transparent animationType="slide" onRequestClose={closePicker}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePicker}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {activePicker === 'programme' ? t('signup.selectProgramme') : t('signup.selectLevel')}
            </Text>
            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => item}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOptionRow} onPress={() => handleSelectOption(item)}>
                  <Text style={styles.modalOptionText}>{item}</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default SignupScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const LOGO_SIZE = 100;
const H_PADDING = 24;

function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    top: 60,
    left: 20,
  },
  dotGridBottomRight: {
    bottom: 140,
    right: 24,
  },
  ghostIcon: {
    position: 'absolute',
    opacity: 0.07,
  },
  ghostCap: {
    top: '4%',
    left: '10%',
  },
  ghostBook: {
    top: '2%',
    right: '18%',
  },
  ghostUsers: {
    top: '6%',
    right: '4%',
    transform: [{ rotate: '4deg' }],
  },
  ghostPin: {
    top: '30%',
    right: '6%',
  },
  ghostBuildingLeft: {
    top: '15%',
    left: '3%',
  },
  ghostBuildingRight: {
    top: '15%',
    right: '3%',
  },

  // ---------------- Branding section ----------------
  brandingSection: {
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: H_PADDING,
  },
  logoWrap: {
    width: LOGO_SIZE + 30,
    height: LOGO_SIZE + 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    marginTop: -4,
  },
  bookWrap: {
    position: 'absolute',
    bottom: -11,
    width: 42,
    height: 30,
    borderRadius: 9,
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
    top: 4,
    width: LOGO_SIZE - 14,
    height: LOGO_SIZE - 14,
    borderRadius: (LOGO_SIZE - 14) / 2,
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
    top: 14,
    left: 16,
  },
  nodeRight: {
    top: 14,
    right: 16,
  },
  appName: {
    fontSize: 28,
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
    marginTop: 20,
    marginBottom: 18,
    paddingHorizontal: H_PADDING,
  },
  headingTitle: {
    fontSize: 22,
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
    backgroundColor: COLORS.card,
    borderRadius: 26,
    marginHorizontal: H_PADDING,
    padding: 22,
    ...SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 9,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: COLORS.card,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  inputWrapperReadOnly: {
    backgroundColor: COLORS.chipBg,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dropdownText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 8,
  },
  errorText: {
    fontSize: 11.5,
    color: COLORS.danger,
    marginLeft: 5,
    flexShrink: 1,
  },

  // Department + Level row
  rowFields: {
    flexDirection: 'row',
    marginTop: 18,
  },
  rowFieldHalf: {
    flex: 1,
  },

  // Create Account button
  createAccountButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  createAccountButtonDisabled: {
    opacity: 0.7,
  },
  createAccountButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ---------------- Log in + trust badge ----------------
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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

  // ---------------- Picker modal ----------------
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
    paddingBottom: 28,
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
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  });
}
