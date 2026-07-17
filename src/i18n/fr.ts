/**
 * EduSphere — i18n/fr.ts
 * French translations. Typed against en.ts's shape (TranslationDictionary)
 * so a missing key is a compile error.
 */
import { TranslationDictionary } from './en';

const fr: TranslationDictionary = {
  common: {
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    remove: 'Retirer',
    retry: 'Réessayer',
    loading: 'Chargement...',
    error: 'Erreur',
    somethingWentWrong: "Une erreur s'est produite. Veuillez réessayer.",
    ok: 'OK',
    edit: 'Modifier',
    share: 'Partager',
    report: 'Signaler',
    open: 'Ouvrir',
    join: 'Rejoindre',
    view: 'Voir',
    seeAll: 'Tout voir',
    search: 'Rechercher',
  },
  nav: {
    home: 'Accueil',
    groups: 'Groupes',
    resources: 'Ressources',
    map: 'Carte',
    profile: 'Profil',
  },
  splash: {
    tagline: 'Groupes d’étude et ressources du campus',
    badge: 'Pour les étudiants du KNUST',
    loading: 'Chargement de votre espace d’étude...',
  },
  login: {
    welcomeBack: 'Content de vous revoir',
    subtitle: 'Connectez-vous pour continuer votre parcours d’étude',
    emailLabel: 'Email KNUST',
    knustOnly: 'Réservé aux étudiants du KNUST',
    passwordLabel: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    logIn: 'Se connecter',
    noAccount: "Vous n'avez pas de compte ? ",
    signUp: 'Créer un compte',
    trustBadge: 'Accès KNUST vérifié',
  },
  settings: {
    title: 'Paramètres',
    appearance: 'Apparence',
    language: 'Langue',
    about: 'À propos',
    theme: {
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
    },
  },
};

export default fr;
