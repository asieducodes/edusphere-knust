/**
 * EduSphere — navigation/types.ts
 * -----------------------------------------------------------------------
 * Shared navigation types + the Group data shape passed as route params.
 * Import from here instead of redefining param lists per-screen — this
 * is what gives you autocomplete and type-checking on navigation.navigate()
 * calls and route.params across the whole app.
 * -----------------------------------------------------------------------
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/** Shared shape for a study group, used wherever a group is passed as a
 *  navigation param (GroupsScreen card tap, HomeScreen card tap, etc). */
export interface Group {
  id: string;
  categoryShort: string; // e.g. "CS" — shown in the hero card badge
  code: string; // e.g. "CSM 351"
  name: string; // e.g. "CSM 351 Data Structures"
  subtitle: string; // e.g. "Data Structures and Algorithms"
  description: string;
  members: number;
  rating: number;
  status: 'Active' | 'Inactive';
  groupType: 'Public Group' | 'Private Group';
  isJoined: boolean;
}

/** Shared shape for a resource, used wherever a resource is passed as a
 *  navigation param (ResourcesScreen row tap, GroupDetails resource tap). */
export interface ResourceData {
  id: string;
  title: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX';
  courseCode: string;
  category: string;
  description: string;
  size: string;
  uploaded: string;
  downloads: number;
  saves: number;
  rating: number;
  visibility: 'Public' | 'Group Only' | 'Private';
  uploader: {
    name: string;
    initials: string;
    programme: string;
    level: string;
    verified: boolean;
  };
}

/** Tabs rendered inside the bottom tab bar (see MainTabNavigator.tsx). */
export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  Resources: undefined;
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
  GroupDetails: { group?: Group } | undefined;
  CreateGroup: undefined;
  ResourceDetails: { resource?: ResourceData } | undefined;
  UploadResource: undefined;
  EditProfile: undefined;
};

/** Backward-compatible alias — screens written before this Auth/Main
 *  split (GroupDetailsScreen, HomeScreen, etc.) import RootStackParamList
 *  by name. Keeping this alias means they keep working unchanged; new
 *  code should prefer the clearer MainStackParamList name directly. */
export type RootStackParamList = MainStackParamList;
