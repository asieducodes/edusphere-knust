/**
 * EduSphere — screens/LoginScreen.tsx
 * -----------------------------------------------------------------------
 * Auth entry point. Reached from SplashScreen when there's no logged-in
 * student. Uses the same logo emblem concept as SplashScreen.tsx, but in
 * the light/blue-on-white palette that fits a login screen.
 *
 * INSTALLATION:
 *   npx expo install expo-linear-gradient
 * (@expo/vector-icons is already part of this project.)
 * -----------------------------------------------------------------------
 */

import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLORS, SHADOW } from "../theme/colors";
import { AuthStackParamList } from "../navigation/types";
import { validateLoginForm } from "../utils/authValidation";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// -----------------------------------------------------------------------
// SMALL DECORATIVE PIECES
// -----------------------------------------------------------------------

/** A single very-faint outline icon scattered in the background. */
const GhostIcon: React.FC<{ children: React.ReactNode; style: object }> = ({
  children,
  style,
}) => <View style={[styles.ghostIcon, style]}>{children}</View>;

/** Small grid of faint dots, matching the texture used on SplashScreen. */
const DotGrid: React.FC<{ rows: number; cols: number; style: object }> = ({
  rows,
  cols,
  style,
}) => {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(<View key={`${r}-${c}`} style={styles.dotGridDot} />);
    }
  }
  return (
    <View style={[styles.dotGridWrap, style, { width: cols * 14 }]}>
      {dots}
    </View>
  );
};

/** Same logo emblem concept as SplashScreen.tsx, recolored for a white
 *  background: blue ring + blue graduation cap instead of white-on-blue. */
const LogoEmblem: React.FC = () => (
  <View style={styles.logoWrap}>
    <View style={styles.nodeArc} />
    <View style={[styles.node, styles.nodeTop]} />
    <View style={[styles.node, styles.nodeLeft]} />
    <View style={[styles.node, styles.nodeRight]} />

    <View style={styles.logoCircle}>
      <FontAwesome5
        name="graduation-cap"
        size={40}
        color={COLORS.primary}
        style={styles.capIcon}
      />
      <View style={styles.bookWrap}>
        <Feather name="book-open" size={26} color={COLORS.white} />
      </View>
    </View>
  </View>
);

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { errors } = submitted
    ? validateLoginForm(email, password)
    : { errors: {} as Record<string, string> };
  const emailError = errors.email;
  const passwordError = errors.password;

  const handleLogin = () => {
    setSubmitted(true);
    const { isValid } = validateLoginForm(email, password);

    // Placeholder — replace with a real auth call (Supabase, your API, etc).
    console.log("Login pressed", { email });

    if (!isValid) return; // Do not proceed, and do not call any backend/context action.

    // Flips shared auth state to true — RootNavigator is watching this via
    // useAuth() and will swap from AuthStack to MainStackNavigator on its
    // own. There's no direct navigation.navigate('MainTabs') here because
    // MainTabs lives in a completely different navigator tree once auth
    // and main are split (see navigation/RootNavigator.tsx).
    login();
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Decorative background layer — sits behind everything else */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={["rgba(45,63,224,0.16)", "rgba(45,63,224,0)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.3, y: 0.6 }}
          style={styles.blobTopRight}
        />
        <LinearGradient
          colors={["rgba(45,63,224,0.85)", "rgba(59,78,240,0.55)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0.8, y: 0.2 }}
          style={styles.blobBottomLeft}
        />

        <DotGrid rows={5} cols={3} style={styles.dotGridTopLeft} />
        <DotGrid rows={5} cols={3} style={styles.dotGridBottomRight} />

        <GhostIcon style={styles.ghostBook}>
          <Feather name="book-open" size={40} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostUsers}>
          <Feather name="users" size={36} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostPin}>
          <Feather name="map-pin" size={30} color={COLORS.primary} />
        </GhostIcon>
        <GhostIcon style={styles.ghostBuilding}>
          <MaterialCommunityIcons
            name="bank"
            size={90}
            color={COLORS.primary}
          />
        </GhostIcon>
        <GhostIcon style={styles.ghostStack}>
          <MaterialCommunityIcons
            name="book-multiple-outline"
            size={34}
            color={COLORS.primary}
          />
        </GhostIcon>
        <GhostIcon style={styles.ghostCap}>
          <FontAwesome5
            name="graduation-cap"
            size={30}
            color={COLORS.primary}
          />
        </GhostIcon>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
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
            <Text style={styles.appSubtitle}>
              Campus Study Group & Resource Finder
            </Text>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* WELCOME TEXT                                                */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your study journey
            </Text>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* LOGIN FORM CARD                                             */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.formCard}>
            {/* KNUST Email */}
            <Text style={styles.fieldLabel}>KNUST Email</Text>
            <View
              style={[
                styles.inputWrapper,
                emailError && styles.inputWrapperError,
              ]}
            >
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
            {emailError ? (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={12} color={COLORS.danger} />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            ) : (
              <View style={styles.helperRow}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.helperText}>KNUST students only</Text>
              </View>
            )}

            {/* Password */}
            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordError && styles.inputWrapperError,
              ]}
            >
              <Feather name="lock" size={17} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
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
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={17}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={12} color={COLORS.danger} />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotPasswordWrap}
              onPress={handleForgotPassword}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Log In button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* SIGN UP + TRUST BADGE                                       */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={handleSignUp}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustBadgeRow}>
            <MaterialCommunityIcons
              name="shield-check"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.trustBadgeText}>Verified KNUST access</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const LOGO_SIZE = 110;
const H_PADDING = 24;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBFCFE",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ---------------- Decorative background ----------------
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blobTopRight: {
    position: "absolute",
    top: -SCREEN_WIDTH * 0.25,
    right: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.42,
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: -SCREEN_WIDTH * 0.32,
    left: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    borderRadius: SCREEN_WIDTH * 0.48,
  },
  dotGridWrap: {
    position: "absolute",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dotGridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(45,63,224,0.18)",
    margin: 5,
  },
  dotGridTopLeft: {
    top: 90,
    left: 20,
  },
  dotGridBottomRight: {
    bottom: 170,
    right: 24,
  },
  ghostIcon: {
    position: "absolute",
    opacity: 0.07,
  },
  ghostBook: {
    top: "11%",
    left: "7%",
    transform: [{ rotate: "-10deg" }],
  },
  ghostUsers: {
    top: "27%",
    right: "9%",
  },
  ghostPin: {
    top: "46%",
    right: "7%",
  },
  ghostBuilding: {
    top: "30%",
    left: -14,
    opacity: 0.06,
  },
  ghostStack: {
    bottom: "18%",
    right: "10%",
  },
  ghostCap: {
    bottom: "10%",
    right: "16%",
    transform: [{ rotate: "8deg" }],
  },

  // ---------------- Branding section ----------------
  brandingSection: {
    alignItems: "center",
    paddingTop: 18,
    paddingHorizontal: H_PADDING,
  },
  logoWrap: {
    width: LOGO_SIZE + 32,
    height: LOGO_SIZE + 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },
  capIcon: {
    marginTop: -4,
  },
  bookWrap: {
    position: "absolute",
    bottom: -12,
    width: 46,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  nodeArc: {
    position: "absolute",
    top: 4,
    width: LOGO_SIZE - 16,
    height: LOGO_SIZE - 16,
    borderRadius: (LOGO_SIZE - 16) / 2,
    borderWidth: 1.5,
    borderColor: COLORS.primarySoft,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "-35deg" }],
  },
  node: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  nodeTop: {
    top: 0,
    alignSelf: "center",
  },
  nodeLeft: {
    top: 16,
    left: 18,
  },
  nodeRight: {
    top: 16,
    right: 18,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // ---------------- Welcome section ----------------
  welcomeSection: {
    alignItems: "center",
    marginTop: 26,
    marginBottom: 22,
    paddingHorizontal: H_PADDING,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // ---------------- Form card ----------------
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    marginHorizontal: H_PADDING,
    padding: 22,
    ...SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 9,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 5,
  },
  forgotPasswordWrap: {
    alignSelf: "flex-end",
    marginTop: 14,
    marginBottom: 22,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ---------------- Sign up + trust badge ----------------
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signUpText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.primary,
  },
  trustBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  trustBadgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
});
