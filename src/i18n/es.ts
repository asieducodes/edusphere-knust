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
