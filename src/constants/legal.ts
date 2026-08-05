/**
 * EduSphere — constants/legal.ts
 * -----------------------------------------------------------------------
 * Public URLs for the Privacy Policy / Terms of Service, hosted as static
 * pages by the backend (backend/public/, served by backend/src/app.ts) —
 * same pattern as the /verified and /reset-password auth-email landing
 * pages. Derived from API_BASE_URL (which points at .../api) by dropping
 * the /api suffix, so these always match whichever backend the app is
 * currently pointed at.
 * -----------------------------------------------------------------------
 */

import { API_BASE_URL } from '../services/api';

const WEB_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const PRIVACY_POLICY_URL = `${WEB_BASE_URL}/privacy-policy`;
export const TERMS_OF_SERVICE_URL = `${WEB_BASE_URL}/terms-of-service`;
