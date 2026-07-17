/**
 * EduSphere — i18n/en.ts
 * -----------------------------------------------------------------------
 * Source-of-truth translation dictionary — fr.ts/es.ts are typed against
 * this shape (`typeof en`), so a missing key in either is a compile
 * error, not a silent English fallback discovered at runtime.
 * Namespaced per screen/shared-area so a key's home is obvious from its
 * path (e.g. t('groupDetails.joinGroup')).
 * -----------------------------------------------------------------------
 */

const en = {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    remove: 'Remove',
    retry: 'Try Again',
    loading: 'Loading...',
    error: 'Error',
    somethingWentWrong: 'Something went wrong. Please try again.',
    ok: 'OK',
    edit: 'Edit',
    share: 'Share',
    report: 'Report',
    open: 'Open',
    join: 'Join',
    view: 'View',
    seeAll: 'View all',
    search: 'Search',
  },
  nav: {
    home: 'Home',
    groups: 'Groups',
    resources: 'Resources',
    map: 'Map',
    profile: 'Profile',
  },
  splash: {
    tagline: 'Campus Study Group & Resource Finder',
    badge: 'For KNUST Students',
    loading: 'Loading your study space...',
  },
  login: {
    welcomeBack: 'Welcome back',
    subtitle: 'Sign in to continue your study journey',
    emailLabel: 'KNUST Email',
    knustOnly: 'KNUST students only',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot Password?',
    logIn: 'Log In',
    noAccount: "Don't have an account? ",
    signUp: 'Sign Up',
    trustBadge: 'Verified KNUST access',
  },
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    language: 'Language',
    about: 'About',
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  },
};

export default en;
export type TranslationDictionary = typeof en;
