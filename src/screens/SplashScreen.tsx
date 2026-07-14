/**
 * EduSphere — screens/SplashScreen.tsx
 * -----------------------------------------------------------------------
 * Full-screen branded splash shown on cold start. Auto-advances after a
 * short delay into either the auth flow or the main app, depending on
 * whether the student is logged in (see the placeholder check below).
 *
 * ANIMATION PASS: the UI itself (layout, colors, logo, copy, background)
 * is unchanged from before — this pass only adds motion using React
 * Native's built-in Animated API (no extra install needed; Reanimated
 * isn't in this project, and Animated is more than enough for a splash
 * screen's one-time entrance/exit sequence).
 *
 * Sequence (matches the requested timing):
 *   0.0s  background visible
 *   0.2s  logo scales + fades in, with a soft spring "settle" at the end
 *   0.5s  app name fades up
 *   0.7s  tagline fades up
 *   0.9s  KNUST badge fades up
 *   ~1.1s logo starts a slow, subtle pulse loop (scale 1 ↔ 1.03)
 *   1.0s  loading dots begin their sequential pulse loop
 *   2.0s  whole screen fades out, then navigates
 *
 * INSTALLATION:
 *   npx expo install expo-linear-gradient
 * (@expo/vector-icons is already part of this project.)
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// -----------------------------------------------------------------------
// SMALL DECORATIVE PIECES
// -----------------------------------------------------------------------

/** A single very-faint outline icon scattered in the background. Position
 *  is passed in as a style override so each placement stays declarative.
 *  Now also takes an Animated.Value driving a slow float + fade loop. */
const GhostIcon: React.FC<{
  children: React.ReactNode;
  style: object;
  float: Animated.Value;
  floatRange?: number;
}> = ({ children, style, float, floatRange = 6 }) => {
  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [floatRange, -floatRange],
  });
  const opacity = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.1],
  });

  return (
    <Animated.View
      style={[
        styles.ghostIcon,
        style,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/** A small grid of faint dots — used top-right and bottom-right, matching
 *  the reference design's dotted texture. Purely static; the floating
 *  motion is reserved for the icon set so the background doesn't get busy. */
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

/** The three-dot loading indicator. Each dot pulses opacity in its own
 *  looped animation, staggered so the pulse visibly travels left→right,
 *  reading as a modern "in progress" indicator rather than three dots
 *  blinking in unison. */
const LoadingDots: React.FC<{
  dot1: Animated.Value;
  dot2: Animated.Value;
  dot3: Animated.Value;
}> = ({ dot1, dot2, dot3 }) => (
  <View style={styles.dotsRow}>
    <Animated.View style={[styles.dot, { opacity: dot1 }]} />
    <Animated.View style={[styles.dot, { opacity: dot2 }]} />
    <Animated.View style={[styles.dot, { opacity: dot3 }]} />
  </View>
);

/** The central circular logo emblem: white ring, graduation cap, an open
 *  book overlapping the bottom edge, and small "connection" nodes arcing
 *  across the top — built entirely from Views/icons, no image assets.
 *  Unchanged visually; just rendered inside an Animated.View by the parent. */
const LogoEmblem: React.FC = () => (
  <View style={styles.logoWrap}>
    {/* Connection nodes + arc, sitting above the ring */}
    <View style={styles.nodeArc} />
    <View style={[styles.node, styles.nodeTop]} />
    <View style={[styles.node, styles.nodeLeft]} />
    <View style={[styles.node, styles.nodeRight]} />

    {/* Outer ring */}
    <View style={styles.logoCircle}>
      <FontAwesome5
        name="graduation-cap"
        size={46}
        color="#FFFFFF"
        style={styles.capIcon}
      />

      {/* Open book, overlapping the bottom edge of the circle */}
      <View style={styles.bookWrap}>
        <Feather
          name="book-open"
          size={30}
          color={styles.bookIconColor.color}
        />
      </View>
    </View>
  </View>
);

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isEmailVerified, pendingEmail } = useAuth();

  // ---- Animated values ------------------------------------------------
  // Kept in refs so they're created once and persist across re-renders.
  const pageOpacity = useRef(new Animated.Value(1)).current; // page-wide exit fade

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoEntranceScale = useRef(new Animated.Value(0.82)).current; // entrance: small → full size
  const logoPulseScale = useRef(new Animated.Value(1)).current; // post-entrance: gentle breathing loop

  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(14)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(14)).current;

  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(14)).current;

  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;

  // Two independent drivers for the background ghost icons, with slightly
  // different loop durations so icons don't all float in perfect unison —
  // reads as organic rather than mechanical, while staying very subtle.
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ---- Fade/slide helper for the name/tagline/badge, which all share
    // the same entrance shape (fade in + slide up), just at different times.
    const fadeSlideIn = (
      opacity: Animated.Value,
      translateY: Animated.Value,
      delay: number,
    ) =>
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

    // ---- Logo entrance: fade in while springing from 0.82 → 1 scale.
    // The spring (rather than a plain timing) is what gives the "very
    // subtle bounce" the spec asks for — a slight, natural overshoot
    // rather than a cartoonish rubber-band bounce.
    const logoEntrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoEntranceScale, {
        toValue: 1,
        delay: 200,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]);

    // Kick off the full entrance sequence.
    logoEntrance.start(() => {
      // Once the logo has settled, start its slow "breathing" pulse loop —
      // scale oscillates between 1 and 1.03, nothing more. This loop keeps
      // running until the screen unmounts (navigation away).
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoPulseScale, {
            toValue: 1.03,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoPulseScale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });

    fadeSlideIn(nameOpacity, nameTranslateY, 500).start();
    fadeSlideIn(taglineOpacity, taglineTranslateY, 700).start();
    fadeSlideIn(badgeOpacity, badgeTranslateY, 900).start();

    // ---- Background ghost icons: slow, continuous float + fade loop.
    // Runs for the whole splash duration — subtle enough not to compete
    // with the foreground content.
    const floatLoop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    const float1Loop = floatLoop(float1, 3000);
    const float2Loop = floatLoop(float2, 3600);
    float1Loop.start();
    float2Loop.start();

    // ---- Loading dots: staggered sequential pulse, starting once the
    // rest of the entrance content is in (~1.0s), looping until exit.
    const dotPulseLoop = (value: Animated.Value, startDelay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(400), // gap before this dot's turn comes around again
        ]),
      );
    const dot1Loop = dotPulseLoop(dot1, 1000);
    const dot2Loop = dotPulseLoop(dot2, 1200);
    const dot3Loop = dotPulseLoop(dot3, 1400);
    dot1Loop.start();
    dot2Loop.start();
    dot3Loop.start();

    // ---- Exit + navigate. Fires at 2.0s, fades the whole page out over
    // 300ms, then navigates once fully faded — landing at ~2.3s total,
    // inside the requested 2–2.5s window.
    const exitTimer = setTimeout(() => {
      Animated.timing(pageOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Only two branches are actually reachable here: RootNavigator
        // only mounts AuthStack (and therefore this screen) when
        // `isAuthenticated && isEmailVerified` is false — so the "logged
        // in and verified → MainTabs" case is handled structurally by
        // RootNavigator swapping to MainStackNavigator, not by a
        // navigate() call from here (MainTabs isn't part of this stack's
        // tree at all).
        if (!isAuthenticated) {
          navigation.replace("Login");
        } else {
          // isAuthenticated is true but isEmailVerified is false — student
          // has an account but hasn't confirmed their email yet.
          navigation.replace("EmailVerification", {
            email: pendingEmail ?? "",
          });
        }
      });
    }, 2000);

    // ---- Cleanup: stop every loop and the pending timer if this screen
    // unmounts early for any reason, so nothing keeps animating in the
    // background or fires a navigation call after unmount.
    return () => {
      clearTimeout(exitTimer);
      float1Loop.stop();
      float2Loop.stop();
      dot1Loop.stop();
      dot2Loop.stop();
      dot3Loop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isAuthenticated, isEmailVerified, pendingEmail]);

  // Combined logo scale = entrance scale × pulse scale, so the same
  // transform smoothly carries from "growing in" straight into "breathing"
  // without a visible seam between the two animations.
  const logoScale = Animated.multiply(logoEntranceScale, logoPulseScale);

  return (
    <Animated.View style={[styles.root, { opacity: pageOpacity }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={["#1B27A8", "#2D3FE0", "#3B4EF0"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        {/* ------------------------------------------------------------ */}
        {/* DECORATIVE BACKGROUND LAYER                                   */}
        {/* ------------------------------------------------------------ */}

        {/* Soft wave blobs for depth — static, these are large soft shapes
            rather than icons, so motion here would be more distracting
            than premium. */}
        <View style={styles.waveTopRight} />
        <View style={styles.waveBottomLeft} />
        <View style={styles.waveBottom} />

        {/* Dotted texture, top-right and bottom-right */}
        <DotGrid rows={6} cols={4} style={styles.dotGridTopRight} />
        <DotGrid rows={5} cols={3} style={styles.dotGridBottomRight} />

        {/* Faint campus-themed outline icons, each gently floating */}
        <GhostIcon style={styles.ghostBook} float={float1} floatRange={5}>
          <Feather name="book-open" size={38} color="#FFFFFF" />
        </GhostIcon>
        <GhostIcon style={styles.ghostUsers} float={float2} floatRange={6}>
          <Feather name="users" size={40} color="#FFFFFF" />
        </GhostIcon>
        <GhostIcon style={styles.ghostChat} float={float1} floatRange={4}>
          <Feather name="message-circle" size={34} color="#FFFFFF" />
        </GhostIcon>
        <GhostIcon style={styles.ghostPin} float={float2} floatRange={5}>
          <Feather name="map-pin" size={34} color="#FFFFFF" />
        </GhostIcon>
        <GhostIcon style={styles.ghostCap} float={float1} floatRange={6}>
          <FontAwesome5 name="graduation-cap" size={30} color="#FFFFFF" />
        </GhostIcon>

        {/* Faint campus building silhouette, lower-left — left static, a
            large silhouette floating would read oddly against smaller
            icons moving at a different rhythm. */}
        <View style={styles.campusWrap}>
          <MaterialCommunityIcons
            name="bank"
            size={110}
            color="#FFFFFF"
            style={styles.campusIcon}
          />
        </View>

        {/* ------------------------------------------------------------ */}
        {/* CENTER CONTENT                                                */}
        {/* ------------------------------------------------------------ */}
        <View style={styles.centerContent}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <LogoEmblem />
          </Animated.View>

          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: nameOpacity,
                transform: [{ translateY: nameTranslateY }],
              },
            ]}
          >
            EduSphere
          </Animated.Text>

          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
              },
            ]}
          >
            Campus Study Group & Resource Finder
          </Animated.Text>

          <Animated.View
            style={[
              styles.badge,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeTranslateY }],
              },
            ]}
          >
            <MaterialCommunityIcons name="bank" size={14} color="#FFFFFF" />
            <Text style={styles.badgeText}>For KNUST Students</Text>
          </Animated.View>
        </View>

        {/* ------------------------------------------------------------ */}
        {/* BOTTOM LOADING AREA                                           */}
        {/* ------------------------------------------------------------ */}
        <View style={styles.bottomArea}>
          <LoadingDots dot1={dot1} dot2={dot2} dot3={dot3} />
          <Text style={styles.loadingText}>Loading your study space...</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default SplashScreen;

// -----------------------------------------------------------------------
// STYLES — unchanged from before this animation pass
// -----------------------------------------------------------------------
const LOGO_SIZE = 132;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#2D3FE0",
  },
  gradient: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // ---------------- Decorative waves ----------------
  waveTopRight: {
    position: "absolute",
    top: -SCREEN_WIDTH * 0.35,
    right: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH * 0.45,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  waveBottomLeft: {
    position: "absolute",
    bottom: -SCREEN_WIDTH * 0.4,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.42,
    backgroundColor: "rgba(19,26,140,0.35)",
  },
  waveBottom: {
    position: "absolute",
    bottom: -SCREEN_HEIGHT * 0.08,
    left: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_HEIGHT * 0.22,
    borderRadius: SCREEN_WIDTH * 0.65,
    backgroundColor: "rgba(255,255,255,0.05)",
    transform: [{ scaleX: 1.4 }],
  },

  // ---------------- Dot grid texture ----------------
  dotGridWrap: {
    position: "absolute",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dotGridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    margin: 5,
  },
  dotGridTopRight: {
    top: 70,
    right: 24,
  },
  dotGridBottomRight: {
    bottom: 90,
    right: 20,
  },

  // ---------------- Ghost icons ----------------
  ghostIcon: {
    position: "absolute",
  },
  ghostBook: {
    top: "15%",
    left: "8%",
    transform: [{ rotate: "-12deg" }],
  },
  ghostUsers: {
    top: "20%",
    right: "10%",
  },
  ghostChat: {
    top: "40%",
    left: "6%",
  },
  ghostPin: {
    top: "46%",
    right: "8%",
  },
  ghostCap: {
    bottom: "30%",
    right: "14%",
    transform: [{ rotate: "10deg" }],
  },

  // ---------------- Campus silhouette ----------------
  campusWrap: {
    position: "absolute",
    bottom: 0,
    left: -10,
    opacity: 0.07,
  },
  campusIcon: {
    // Icon itself carries the shape; wrapper just positions + dims it.
  },

  // ---------------- Center content ----------------
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  // Logo emblem
  logoWrap: {
    width: LOGO_SIZE + 40,
    height: LOGO_SIZE + 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  capIcon: {
    marginTop: -6,
  },
  bookWrap: {
    position: "absolute",
    bottom: -14,
    width: 56,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF0FB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  bookIconColor: {
    color: "#2D3FE0",
  },
  // Connection nodes arcing over the top of the ring
  nodeArc: {
    position: "absolute",
    top: 6,
    width: LOGO_SIZE - 20,
    height: LOGO_SIZE - 20,
    borderRadius: (LOGO_SIZE - 20) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "-35deg" }],
  },
  node: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  nodeTop: {
    top: 0,
    alignSelf: "center",
  },
  nodeLeft: {
    top: 18,
    left: 22,
  },
  nodeRight: {
    top: 18,
    right: 22,
  },

  // App name + tagline
  appName: {
    fontSize: 50,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 21,
  },

  // KNUST badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },

  // Bottom loading area
  bottomArea: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.75)",
  },
});
