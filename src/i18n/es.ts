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
  signup: {
    createAccount: 'Crea tu cuenta',
    subtitle: 'Únete a miles de estudiantes de KNUST que aprenden juntos',
    fullNameLabel: 'Nombre completo',
    fullNamePlaceholder: 'Ingresa tu nombre completo',
    emailLabel: 'Correo KNUST',
    knustOnly: 'Solo para estudiantes de KNUST',
    programmeLabel: 'Programa',
    programmePlaceholder: 'Selecciona tu programa',
    departmentLabel: 'Departamento',
    departmentPlaceholder: 'Selecciona el departamento',
    departmentMissing: 'Por favor selecciona tu departamento.',
    loading: 'Cargando...',
    levelLabel: 'Nivel',
    levelPlaceholder: 'Selecciona el nivel',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Crea una contraseña',
    confirmPasswordLabel: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Confirma tu contraseña',
    createAccountButton: 'Crear cuenta',
    haveAccount: '¿Ya tienes una cuenta? ',
    logIn: 'Iniciar sesión',
    trustBadge: 'Acceso KNUST verificado',
    selectProgramme: 'Seleccionar programa',
    selectDepartment: 'Seleccionar departamento',
    selectLevel: 'Seleccionar nivel',
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
