export type LocationCategory = 'library' | 'lecture_hall' | 'hostel' | 'study_spot' | 'landmark';

export interface CampusLocation {
  id: string;
  name: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  description: string | null;
}
