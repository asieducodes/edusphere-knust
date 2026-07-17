/**
 * EduSphere — i18n/es.ts
 * Spanish translations. Typed against en.ts's shape (TranslationDictionary)
 * so a missing key is a compile error.
 */
import { TranslationDictionary } from './en';

const es: TranslationDictionary = {
  common: {
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    remove: 'Quitar',
    retry: 'Reintentar',
    loading: 'Cargando...',
    error: 'Error',
    somethingWentWrong: 'Algo salió mal. Inténtalo de nuevo.',
    ok: 'Aceptar',
    edit: 'Editar',
    share: 'Compartir',
    report: 'Reportar',
    open: 'Abrir',
    join: 'Unirse',
    view: 'Ver',
    seeAll: 'Ver todo',
    search: 'Buscar',
  },
  nav: {
    home: 'Inicio',
    groups: 'Grupos',
    resources: 'Recursos',
    map: 'Mapa',
    profile: 'Perfil',
  },
  splash: {
    tagline: 'Grupos de estudio y recursos del campus',
    badge: 'Para estudiantes de KNUST',
    loading: 'Cargando tu espacio de estudio...',
  },
  login: {
    welcomeBack: 'Bienvenido de nuevo',
    subtitle: 'Inicia sesión para continuar tu camino de estudio',
    emailLabel: 'Correo KNUST',
    knustOnly: 'Solo para estudiantes de KNUST',
    passwordLabel: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    logIn: 'Iniciar sesión',
    noAccount: '¿No tienes una cuenta? ',
    signUp: 'Regístrate',
    trustBadge: 'Acceso KNUST verificado',
  },
  settings: {
    title: 'Configuración',
    appearance: 'Apariencia',
    language: 'Idioma',
    about: 'Acerca de',
    theme: {
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
  },
};

export default es;
