# Architecture

## Navigation

`RootNavigator` reads auth state from `AuthContext` and switches between two stacks:

- **AuthStackNavigator** — Splash → Login / Signup / ForgotPassword / EmailVerification
- **MainStackNavigator** — wraps `MainTabNavigator` (Home, Groups, Resources, Map, Profile via `CustomTabBar`) plus modal/detail screens (GroupDetails, CreateGroup, ResourceDetails, UploadResource, EditProfile)

```
App.tsx
 └─ AuthProvider (AuthContext)
     └─ RootNavigator
         ├─ AuthStackNavigator   (if !session)
         └─ MainStackNavigator   (if session)
             └─ MainTabNavigator
```

## State & Auth

`AuthContext` currently exposes `login / completeSignup / logout / verifyEmail` as placeholders. These will be replaced 1:1 with calls to the FastAPI `/api/auth/*` endpoints (JWT access + refresh tokens stored via `expo-secure-store`) — the navigation layer doesn't need to change since it only depends on the `session` shape.

## Services Layer

All network calls go through domain services (`services/auth.ts`, `services/group.ts`, etc.), which call a shared `api.ts` axios instance pointed at `EXPO_PUBLIC_API_BASE_URL`. This keeps screens free of direct fetch/axios calls.

## Data Flow

```
Screen → Service (e.g. groupService.createGroup) → axios (api.ts) → FastAPI route → SQLAlchemy model → Postgres
```

Access control is enforced in FastAPI route handlers/dependencies (JWT-derived user + ownership checks), rather than database-level RLS. For example:
- Users can only read/write their own profile (enforced via the authenticated user dependency).
- Group membership endpoints check the requester is the member or group host before allowing writes.
- Resource uploads require a verified KNUST account (checked in the `resources` router before calling `storage.upload_resource_file`).

## Validation

`utils/authValidation.ts` centralizes KNUST email domain checks (`@knust.edu.gh`, `@st.knust.edu.gh`) and form validation for Login/Signup/ForgotPassword, mirroring the same domain allowlist enforced server-side in `app/api/routes/auth.py` via `settings.ALLOWED_EMAIL_DOMAINS`.
