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

`AuthContext` currently exposes `login / completeSignup / logout / verifyEmail` as placeholders. These will be replaced 1:1 with Supabase Auth calls (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`, etc.) — the navigation layer doesn't need to change since it only depends on the `session` shape.

## Services Layer

All network calls go through domain services (`services/auth.ts`, `services/group.ts`, etc.), which call a shared `api.ts` axios instance. This keeps screens free of direct fetch/axios calls and makes swapping REST-style calls for direct Supabase client calls a localized change.

## Data Flow

```
Screen → Service (e.g. groupService.createGroup) → Supabase client → Postgres (RLS-enforced)
```

Row-Level Security policies (see `backend/supabase/migrations/`) enforce that:
- Users can only read/write their own profile.
- Group membership rows are only writable by the member or group host.
- Resource uploads are scoped to verified KNUST accounts.

## Validation

`utils/authValidation.ts` centralizes KNUST email domain checks (`@knust.edu.gh`, `@st.knust.edu.gh`) and form validation for Login/Signup/ForgotPassword, so the same rules apply on both the client and can be mirrored in Supabase Auth hooks server-side.
