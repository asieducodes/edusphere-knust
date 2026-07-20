/**
 * EduSphere — navigation/types.ts
 * -----------------------------------------------------------------------
 * Shared navigation types. Import from here instead of redefining param
 * lists per-screen — this is what gives you autocomplete and type-checking
 * on navigation.navigate() calls and route.params across the whole app.
 *
 * GroupDetails/ResourceDetails take only an id, not a full object — the
 * destination screen fetches fresh real data via groupService/resourceService
 * (src/types/group.ts's Group / src/types/resource.ts's Resource), rather
 * than every caller constructing a duplicate local object to pass through
 * params. Always fresh, no dual type shapes to keep in sync.
 * -----------------------------------------------------------------------
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AppNotification } from '../types/notification';

/** Tabs rendered inside the bottom tab bar (see MainTabNavigator.tsx). */
export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  /** initialSearch lets HomeScreen's search bar hand off the typed query
   *  instead of just switching tabs and discarding it. */
  Resources: { initialSearch?: string } | undefined;
  Map: undefined;
  Profile: undefined;
};

/** Screens shown before the student is authenticated + verified: the
 *  splash/loading screen and every screen in the login/signup flow.
 *  Lives in navigation/AuthStackNavigator.tsx. */
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
};

/** The authenticated app: the tab bar itself, plus any screen that opens
 *  "on top of" the tabs (hiding the bottom nav) — detail screens and
 *  action/form screens both live here. Lives in
 *  navigation/MainStackNavigator.tsx. Add future screens the same way. */
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  GroupDetails: { groupId: string };
  MemberProfile: { userId: string };
  PostDetails: { postId: string; groupId: string };
  Search: { initialQuery?: string } | undefined;
  Settings: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
  MyReports: undefined;
  CreateGroup: undefined;
  ResourceDetails: { resourceId: string };
  ResourcePreview: { resourceId: string };
  UploadResource: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  /** Takes the full notification, not just an id — notification content is
   *  immutable once created (only isRead changes, tracked separately in the
   *  list screen), and there's no single-notification GET endpoint, so
   *  refetching would add a round trip for no benefit. */
  NotificationDetail: { notification: AppNotification };
  Call: { groupId: string };
};

/** Backward-compatible alias — screens written before this Auth/Main
 *  split (GroupDetailsScreen, HomeScreen, etc.) import RootStackParamList
 *  by name. Keeping this alias means they keep working unchanged; new
 *  code should prefer the clearer MainStackParamList name directly. */
export type RootStackParamList = MainStackParamList;
