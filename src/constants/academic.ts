/**
 * EduSphere — constants/academic.ts
 * -----------------------------------------------------------------------
 * Programme has no backing endpoint (see courseService.ts's comment on
 * why — the seeded departments/courses tables are nowhere near a full
 * KNUST catalog), so it stays a static list here rather than a fetched
 * one. PROGRAMME_TO_DEPARTMENT maps each option to the real department
 * name it belongs to, so picking a programme can auto-select the matching
 * Department — matched by name against whatever courseService.getDepartments()
 * returns, not by a fixed id, since department ids vary per environment/seed.
 * Shared by SignupScreen and EditProfileScreen — was duplicated between
 * them before this file existed.
 * -----------------------------------------------------------------------
 */

export const PROGRAMME_OPTIONS = [
  'BSc Computer Science',
  'BSc Information Technology',
  'BSc Mathematics',
  'BSc Statistics',
  'BSc Business Administration',
  'BSc Agricultural Engineering',
  'BSc Aerospace Engineering',
  'BSc Biomedical Engineering',
  'BSc Chemical Engineering',
  'BSc Civil Engineering',
  'BSc Computer Engineering',
  'BSc Electrical Engineering',
  'BSc Geological Engineering',
  'BSc Geomatic Engineering',
  'BSc Materials Engineering',
  'BSc Mechanical Engineering',
  'BSc Metallurgical Engineering',
  'BSc Petroleum Engineering',
  'BSc Telecommunication Engineering',
];

export const LEVEL_OPTIONS = ['Level 100', 'Level 200', 'Level 300', 'Level 400'];

/** Programme display name -> Department name (matched against the real
 *  Department[] fetched from the backend). */
export const PROGRAMME_TO_DEPARTMENT: Record<string, string> = {
  'BSc Computer Science': 'Computer Science',
  'BSc Information Technology': 'Information Technology',
  'BSc Mathematics': 'Mathematics',
  'BSc Statistics': 'Statistics',
  'BSc Business Administration': 'Business Administration',
  'BSc Agricultural Engineering': 'Agricultural Engineering',
  'BSc Aerospace Engineering': 'Aerospace Engineering',
  'BSc Biomedical Engineering': 'Biomedical Engineering',
  'BSc Chemical Engineering': 'Chemical Engineering',
  'BSc Civil Engineering': 'Civil Engineering',
  'BSc Computer Engineering': 'Computer Engineering',
  'BSc Electrical Engineering': 'Electrical Engineering',
  'BSc Geological Engineering': 'Geological Engineering',
  'BSc Geomatic Engineering': 'Geomatic Engineering',
  'BSc Materials Engineering': 'Materials Engineering',
  'BSc Mechanical Engineering': 'Mechanical Engineering',
  'BSc Metallurgical Engineering': 'Metallurgical Engineering',
  'BSc Petroleum Engineering': 'Petroleum Engineering',
  'BSc Telecommunication Engineering': 'Telecommunication Engineering',
};
