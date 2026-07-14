<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B27A8,50:2D3FE0,100:3B4EF0&height=200&section=header&text=EduSphere&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=Campus%20Study%20Group%20and%20Resource%20Finder%20%E2%80%94%20KNUST&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%7C_Auth_%7C_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)

[![CI](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml/badge.svg)](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml)
[![Open Issues](https://img.shields.io/github/issues/asieducodes/edusphere-knust?color=F5A623&style=flat-square)](https://github.com/asieducodes/edusphere-knust/issues)
[![Last Commit](https://img.shields.io/github/last-commit/asieducodes/edusphere-knust?color=2D3FE0&style=flat-square)](https://github.com/asieducodes/edusphere-knust/commits/main)

**EduSphere** is a domain-restricted, mobile-native application built exclusively for KNUST students to discover and join course-specific study groups, share academic resources (past questions, notes, textbooks), and locate on-campus study spots in real time.

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [API Documentation](#api-documentation) · [Team](#team--contributors)

</div>

---

## <img src="https://api.iconify.design/lucide/sparkles.svg?color=%232D3FE0" width="24" valign="middle"/> Features

| | Feature | Description |
|---|---|---|
| <img src="https://api.iconify.design/lucide/lock.svg?color=%232D3FE0" width="20"/> | **Domain-Restricted Auth** | Registration and login restricted to `@knust.edu.gh` / `@st.knust.edu.gh` emails only |
| <img src="https://api.iconify.design/lucide/users.svg?color=%232D3FE0" width="20"/> | **Study Group Engine** | Create, discover, and join course-specific study groups with capacity tracking |
| <img src="https://api.iconify.design/lucide/folder.svg?color=%232D3FE0" width="20"/> | **Resource Repository** | Upload and download past questions, notes, and textbooks |
| <img src="https://api.iconify.design/lucide/message-circle.svg?color=%232D3FE0" width="20"/> | **Discussion Forums** | Threaded asynchronous discussions inside each group workspace |
| <img src="https://api.iconify.design/lucide/map.svg?color=%232D3FE0" width="20"/> | **Campus Study Map** | Interactive map of KNUST libraries, lecture halls, and study spots |
| <img src="https://api.iconify.design/lucide/user-circle.svg?color=%232D3FE0" width="20"/> | **Student Profiles** | Programme/department/college/level, upload history, peer tutor ratings |
| <img src="https://api.iconify.design/lucide/bell.svg?color=%232D3FE0" width="20"/> | **Notification Engine** | In-app alerts for new forum posts, group invites, and rating updates |
| <img src="https://api.iconify.design/lucide/calendar.svg?color=%232D3FE0" width="20"/> | **Session Scheduling** | Group hosts can post shared study session events with time and location |
| <img src="https://api.iconify.design/lucide/star.svg?color=%23F5A623" width="20"/> | **Peer Rating System** | Rate tutors and group hosts after a session |

---

## <img src="https://api.iconify.design/lucide/layers.svg?color=%232D3FE0" width="24" valign="middle"/> Tech Stack

### Mobile App (Frontend)
- **React Native** + **TypeScript**, built and run via **Expo Go**
- **React Navigation** (native-stack + bottom-tabs) for auth/main navigation
- **supabase-js** for authentication, database queries, storage, and realtime subscriptions
- **expo-secure-store** for secure session persistence

### Backend
- **Supabase** — managed Postgres, Auth, Storage, and Realtime in one platform
- **PostgreSQL 15** (Supabase-hosted) as the relational database
- **Row Level Security (RLS) policies** enforce access rules directly in Postgres — e.g. KNUST-domain-only signups, group-membership-gated resource access, host-only session editing
- **Supabase Auth** handles KNUST email/password authentication, verification emails, and password reset — no custom SMTP or JWT signing required
- **Supabase Storage** for academic files (past questions, notes, avatars), with bucket access rules mirroring the RLS policies above
- **Supabase Edge Functions** (Deno/TypeScript) for any server-side logic that doesn't fit cleanly into RLS — e.g. custom notification fan-out, admin moderation actions

> [!NOTE]
> Supabase auto-generates a REST and GraphQL API directly from the Postgres schema (via PostgREST) — there are no hand-written REST route files to maintain. Data access rules live in SQL migrations and RLS policies, not in a separate backend codebase.

> [!IMPORTANT]
> This project began as a web app concept (UI first designed in Google Stitch) before pivoting to a native mobile build. There is no browser-based frontend — the app runs on iOS/Android via Expo Go, not `localhost:5173` in a browser.

---

## <img src="https://api.iconify.design/lucide/rocket.svg?color=%232D3FE0" width="24" valign="middle"/> Getting Started

### Prerequisites
- Node.js >= 18.x, npm >= 9.x
- A [Supabase](https://supabase.com/) account (free tier is sufficient for development)
- Supabase CLI (`npm install -g supabase`) — for local development and migrations
- Docker Desktop — required by the Supabase CLI to run Postgres locally
- Expo Go app (iOS/Android) or a simulator
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/asieducodes/edusphere-knust.git
cd edusphere-knust
```

---

### 2. Backend setup (Supabase)

```bash
cd supabase

# Log in to the Supabase CLI (one-time)
supabase login

# Link this repo to the shared Supabase project
# (ask your backend lead for the project ref)
supabase link --project-ref <project-ref>

# Start Postgres + Auth + Storage locally via Docker
supabase start

# Apply migrations (creates tables, RLS policies, etc.)
supabase db push

# (Optional) seed local dev data
supabase db seed
```

`supabase start` prints local URLs and keys for Studio, the API, and the database — use these in your mobile app's `.env` for local development, or use the hosted project's values from the Supabase dashboard for shared/staging work.

Local Supabase Studio (table editor, auth users, storage): `http://localhost:54323`

---

### 3. Mobile app setup

```bash
# from repo root
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key (see below)

npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `i` / `a` for a simulator.

> [!NOTE]
> Unlike a self-hosted backend, Supabase is reachable over the internet even during local development (unless you're intentionally running fully offline via `supabase start`) — so there's no `localhost`-vs-LAN-IP networking issue between your phone and laptop for the API itself. If you *are* running `supabase start` locally, the same LAN-IP rule applies as with any local server: use your laptop's LAN IP, not `localhost`, in `.env` when testing on a physical device.

---

### 4. Environment variables

**Mobile app `.env`**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> [!WARNING]
> Only ever use the **anon/public** key in the mobile app. The **service role** key bypasses Row Level Security entirely and must never ship inside the app — it's used only in trusted server-side contexts (Edge Functions, admin scripts).

---

## <img src="https://api.iconify.design/lucide/folder-tree.svg?color=%232D3FE0" width="24" valign="middle"/> Project Structure

```
edusphere-knust/
├── App.tsx                          # Mobile app entrypoint (AuthProvider + RootNavigator)
├── src/                             # React Native application
│   ├── components/                  # Shared UI components
│   ├── config/                      # env.ts — typed, validated env var access
│   ├── context/                     # AuthContext — wraps Supabase's session listener
│   ├── lib/                         # supabase.ts — the Supabase client singleton
│   ├── navigation/                  # Root, Auth, Main navigators + CustomTabBar
│   ├── screens/                     # 15 app screens
│   ├── services/                    # authService, groupService, resourceService, + other domain services (supabase-js calls)
│   ├── theme/                       # Colors, spacing, typography
│   ├── types/                       # Shared TypeScript types
│   └── utils/                       # authValidation.ts and other helpers
│
├── supabase/                        # Supabase project config (replaces a custom backend/ folder)
│   ├── migrations/                  # SQL migrations — tables, RLS policies, functions
│   ├── functions/                   # Edge Functions (Deno/TypeScript)
│   ├── seed.sql                     # Local dev seed data
│   └── config.toml                  # Supabase CLI project config
│
├── docs/                            # Architecture & setup guides
├── __tests__/                       # Jest unit + integration tests
└── .github/workflows/               # CI pipeline
```

---

## <img src="https://api.iconify.design/lucide/book-open.svg?color=%232D3FE0" width="24" valign="middle"/> API Documentation

Supabase auto-generates a REST and GraphQL API from the Postgres schema — there's no separate API server or route files to browse. Instead:

- **Supabase Studio** (table editor, auto-generated API reference per table, RLS policy viewer): hosted project dashboard, or `http://localhost:54323` when running locally
- **Auto-generated REST API**: `https://your-project-ref.supabase.co/rest/v1/`
- The mobile app talks to all of this through **supabase-js** rather than raw HTTP calls — each service file in `src/services/` wraps a set of related table queries behind a typed function.

### Common operations by domain

| Domain | supabase-js pattern | Notes |
|---|---|---|
| **Auth** | `supabase.auth.signUp()` / `signInWithPassword()` / `resetPasswordForEmail()` | KNUST domain restriction enforced via a Postgres trigger on `auth.users` |
| **Profile** | `supabase.from('profiles').select()` / `.update()` | RLS restricts writes to the authenticated user's own row |
| **Groups** | `supabase.from('groups').select()` / `.insert()` | Join/leave via `group_members` table, RLS-gated |
| **Resources** | `supabase.from('resources').select()`, `supabase.storage.from('resources').upload()` | Storage bucket policies mirror the resource's `visibility` column |
| **Sessions** | `supabase.from('sessions').select()` / `.insert()` | Scoped to a group via `group_id` foreign key |
| **Ratings** | `supabase.from('ratings').insert()` | One rating per (rater, target) enforced via a unique constraint |
| **Notifications** | `supabase.from('notifications').select()`, realtime subscription for live updates | Powered by Supabase Realtime instead of polling |

---

## <img src="https://api.iconify.design/lucide/users-round.svg?color=%232D3FE0" width="24" valign="middle"/> Team & Contributors

<table>
  <thead>
    <tr>
      <th align="left">Contributor</th>
      <th align="center">Domain / Sub-Team</th>
      <th align="left">Primary Responsibility</th>
      <th align="center">Profile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Asiedu Seth Osei</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Engineering_Lead-2D3FE0?style=flat-square"/></td>
      <td>Backend Lead / System &amp; Software Architect</td>
      <td align="center"><a href="https://github.com/asieducodes">@asieducodes</a></td>
    </tr>
    <tr>
      <td><b>Frimpong Solomon Junior</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Backend_Tier-4F46E5?style=flat-square"/></td>
      <td>Core API Development &amp; Business Logic</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Agyemang Casper Adu-Gyamfi</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Mobile_Frontend-0891B2?style=flat-square"/></td>
      <td>UI Architecture &amp; Mobile Client Implementation</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Ackom Arnold</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Mobile_Frontend-0891B2?style=flat-square"/></td>
      <td>Client-Side Views &amp; User Flow Engineering</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Jessica Oforiwaa Anim</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Data_Architecture-059669?style=flat-square"/></td>
      <td>Relational Database Design &amp; Schema Modeling</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Amuzu Emmanuel</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Data_Architecture-059669?style=flat-square"/></td>
      <td>Database Query Optimizations &amp; Seed Scripts</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Asante Samuel Osei</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Quality_Assurance-EA580C?style=flat-square"/></td>
      <td>Frontend System Testing &amp; Integration Verification</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Samuella Andoh Bannerman</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Quality_Assurance-EA580C?style=flat-square"/></td>
      <td>Backend API Testing &amp; Endpoint Validation Suites</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Daniel Kuma Gyebi</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Technical_Writing-4B5563?style=flat-square"/></td>
      <td>System Documentation &amp; Architecture Manuals</td>
      <td align="center">—</td>
    </tr>
    <tr>
      <td><b>Joshua Adu Sarfo</b></td>
      <td align="center"><img src="https://img.shields.io/badge/Technical_Writing-4B5563?style=flat-square"/></td>
      <td>Technical Specification Documentation &amp; Guides</td>
      <td align="center">—</td>
    </tr>
  </tbody>
</table>

> Developed as a collaborative group engineering project for **KNUST — Department of Computer Engineering**.

---

## <img src="https://api.iconify.design/lucide/scale.svg?color=%232D3FE0" width="24" valign="middle"/> License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B27A8,50:2D3FE0,100:3B4EF0&height=100&section=footer" width="100%"/>
</div>
