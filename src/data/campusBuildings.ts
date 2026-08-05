/**
 * EduSphere — data/campusBuildings.ts
 * -----------------------------------------------------------------------
 * Client-side registry joining backend campus locations (by exact name)
 * to their curated map visuals: the marker image shown on the map, the
 * real reference photo shown on the info card, and that photo's licence
 * attribution.
 *
 * Marker images (assets/markers/) are pre-rendered PNG snapshots of the
 * bespoke building dioramas (see scripts/generate-building-models.mjs) —
 * static images so react-native-maps renders them natively and reliably
 * as Marker `image` props, rather than as live JS view children (which
 * Android can fail to rasterize into a marker bitmap).
 *
 * This stays client-side on purpose: it's purely presentational and only
 * defined for the curated spots, so it isn't worth new DB columns until
 * every college gets its own artwork. Locations not in this registry
 * (colleges that haven't been curated yet) fall back to the generic
 * studySpot marker with no hero photo.
 * -----------------------------------------------------------------------
 */

import { ImageSourcePropType } from 'react-native';

export type BuildingModelKey =
  | 'mainLibrary'
  | 'libraryMall'
  | 'tent'
  | 'auditorium'
  | 'aeroplaneLibrary'
  | 'studySpot';

export interface CampusBuilding {
  modelKey: BuildingModelKey;
  /** Real photo of the place, shown on the info card. */
  heroImage?: ImageSourcePropType;
  /** Licence credit for the hero photo (all via Wikimedia Commons). */
  attribution?: string;
}

/** Pre-rendered marker snapshots, keyed by model — passed directly as a
 *  Marker's `image` prop (react-native-maps expects the raw asset id a
 *  local require() returns, not the broader ImageSourcePropType). */
export const MARKER_IMAGES: Record<BuildingModelKey, number> = {
  mainLibrary: require('../../assets/markers/mainLibrary.png'),
  libraryMall: require('../../assets/markers/libraryMall.png'),
  tent: require('../../assets/markers/tent.png'),
  auditorium: require('../../assets/markers/auditorium.png'),
  aeroplaneLibrary: require('../../assets/markers/aeroplaneLibrary.png'),
  studySpot: require('../../assets/markers/studySpot.png'),
};

/** Curated visuals keyed by the backend location's exact `name`. */
const CAMPUS_BUILDINGS: Record<string, CampusBuilding> = {
  'Prempeh II Library (Main Library)': {
    modelKey: 'mainLibrary',
    heroImage: require('../../assets/reference-photos/mainlibrary.png'),
    attribution: 'Photo: Pascal Kings, Wikimedia Commons (CC BY-SA 4.0)',
  },
  'KNUST Library Mall': {
    modelKey: 'libraryMall',
    heroImage: require('../../assets/reference-photos/library-mall.jpg'),
    attribution: 'Photo: Raizkgh, Wikimedia Commons (CC0)',
  },
  'ICT Centre': {
    modelKey: 'studySpot',
  },
  'Petroleum Building (PB) Tent': {
    modelKey: 'tent',
    heroImage: require('../../assets/reference-photos/petroleum-building.jpg'),
    attribution: 'Photo: Maame1Yaa, Wikimedia Commons (CC0)',
  },
  'Kumapley Building — Top Floor': {
    modelKey: 'auditorium',
    heroImage: require('../../assets/reference-photos/kumapley.jpg'),
    attribution: 'Photo: Maame1Yaa, Wikimedia Commons (CC0)',
  },
  'College of Engineering Library — Aeroplane Building (Top Floor)': {
    modelKey: 'aeroplaneLibrary',
    heroImage: require('../../assets/reference-photos/aeroplane-building.jpg'),
    attribution: 'Photo: Maame1Yaa, Wikimedia Commons (CC BY-SA 4.0)',
  },
};

const FALLBACK: CampusBuilding = { modelKey: 'studySpot' };

/** Visuals for a location; uncurated spots get the generic kiosk. */
export function getCampusBuilding(locationName: string): CampusBuilding {
  return CAMPUS_BUILDINGS[locationName] ?? FALLBACK;
}
