export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  Resources: undefined;
  Map: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  ResourceDetails: { resourceId: string };
  UploadResource: undefined;
  EditProfile: undefined;
};

// Convenience union for screens/hooks that need to navigate across stacks
// (e.g. a Home quick-action card jumping straight into MainStack from a tab screen).
export type RootParamList = MainTabParamList & MainStackParamList;
