<a id="top"></a>
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B27A8,50:2D3FE0,100:3B4EF0&height=200&section=header&text=EduSphere&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=Campus%20Study%20Group%20and%20Resource%20Finder%20%E2%80%94%20KNUST&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![LiveKit](https://img.shields.io/badge/LiveKit-Real--Time_Calls-2D3FE0?style=for-the-badge)](https://livekit.io/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%7C_Auth_%7C_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)

[![CI](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml/badge.svg)](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml)
[![Open Issues](https://img.shields.io/github/issues/asieducodes/edusphere-knust?color=F5A623&style=flat-square)](https://github.com/asieducodes/edusphere-knust/issues)
[![Last Commit](https://img.shields.io/github/last-commit/asieducodes/edusphere-knust?color=2D3FE0&style=flat-square)](https://github.com/asieducodes/edusphere-knust/commits/main)

**EduSphere** is a domain-restricted, mobile-native application built exclusively for KNUST students to discover and join study groups, share academic resources, hold live group discussions and calls, and navigate campus — all in one place.

</div>

---

### Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Status & Roadmap](#status--roadmap)
- [Team & Contributors](#team--contributors)
- [License](#license)

---

<a id="how-it-works"></a>
## <img src="https://api.iconify.design/lucide/route.svg?color=%232D3FE0" width="24" valign="middle"/> How It Works

| Step | |
|---|---|
| **1. Verify** | Sign up with a `@knust.edu.gh` / `@st.knust.edu.gh` email and confirm via the verification link |
| **2. Connect** | Discover a study group for your course, or create one and invite classmates |
| **3. Collaborate** | Share past questions and notes, start a discussion, schedule a session, or jump into a live call |
| **4. Navigate** | Use the campus map to find and get directions to the meetup spot |

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="features"></a>
## <img src="https://api.iconify.design/lucide/sparkles.svg?color=%232D3FE0" width="24" valign="middle"/> Features

| | Feature | Description |
|---|---|---|
| <img src="https://api.iconify.design/lucide/lock.svg?color=%232D3FE0" width="20"/> | **Domain-Restricted Auth** | Registration and login restricted to `@knust.edu.gh` / `@st.knust.edu.gh` emails, with email verification and password reset |
| <img src="https://api.iconify.design/lucide/users.svg?color=%232D3FE0" width="20"/> | **Study Group Engine** | Create, discover, and join study groups; invite members and accept/decline invitations |
| <img src="https://api.iconify.design/lucide/folder.svg?color=%232D3FE0" width="20"/> | **Resource Repository** | Upload, browse, and download academic resources such as past questions and notes |
| <img src="https://api.iconify.design/lucide/message-circle.svg?color=%232D3FE0" width="20"/> | **Discussions & Sessions** | Start text discussions inside a group and schedule study sessions |
| <img src="https://api.iconify.design/lucide/video.svg?color=%232D3FE0" width="20"/> | **Live Group Calls** | Real-time audio/video group calls powered by LiveKit, with a live participant count |
| <img src="https://api.iconify.design/lucide/map.svg?color=%232D3FE0" width="20"/> | **Campus Map** | Browse campus locations and get turn-by-turn directions via the device's native Google Maps app |
| <img src="https://api.iconify.design/lucide/star.svg?color=%232D3FE0" width="20"/> | **Peer Rating System** | Rate groups and members after a session |
| <img src="https://api.iconify.design/lucide/bell.svg?color=%232D3FE0" width="20"/> | **Notifications** | In-app and push notifications (via Expo Notifications) for invites, discussions, and updates |
| <img src="https://api.iconify.design/lucide/user-circle.svg?color=%232D3FE0" width="20"/> | **Rich Profiles** | Programme/department/college/level, study interests, uploads, and saved resources |
| <img src="https://api.iconify.design/lucide/shield.svg?color=%232D3FE0" width="20"/> | **Privacy, Reports & Support** | Privacy & security settings, content reporting, and an in-app Help & Support / FAQ center |
| <img src="https://api.iconify.design/lucide/palette.svg?color=%232D3FE0" width="20"/> | **Theming** | Light, dark, and system themes with four selectable accent colors (blue, red, green, yellow) |
| <img src="https://api.iconify.design/lucide/globe.svg?color=%232D3FE0" width="20"/> | **Internationalization** | Full English, French, and Spanish translations, type-checked against a single source dictionary |

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="screenshots"></a>
## <img src="https://api.iconify.design/lucide/image.svg?color=%232D3FE0" width="24" valign="middle"/> Screenshots

<div align="center">
<table>
  <tr>
    <td align="center" width="14%"><img src="./assets/screenshots/login.png" width="160"/><br/><sub>Login</sub></td>
    <td align="center" width="14%"><img src="./assets/screenshots/signup.png" width="160"/><br/><sub>Sign Up</sub></td>
    <td align="center" width="14%"><img src="./assets/screenshots/home.png" width="160"/><br/><sub>Home</sub></td>
    <td align="center" width="14%"><img src="./assets/screenshots/groups.png" width="160"/><br/><sub>Study Groups</sub></td>
    <td align="center" width="14%"><img src="./assets/screenshots/resources.png" width="160"/><br/><sub>Resources</sub></td>
    <td align="center" width="14%"><img src="./assets/screenshots/map.png" width="160"/><br/><sub>Study Spaces</sub></td>
    <td align="center" width="14%"><img src="./assets/screenshots/profile.png" width="160"/><br/><sub>Profile</sub></td>
  </tr>
</table>
</div>

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="architecture"></a>
## <img src="https://api.iconify.design/lucide/network.svg?color=%232D3FE0" width="24" valign="middle"/> Architecture

<div align="center">
<img src="./assets/diagrams/architecture-diagram.svg" width="700"/>
</div>

The mobile app never talks to Supabase directly. It calls a standalone **Express + TypeScript REST API** (separate repository) over HTTPS, authenticated with a bearer token. That API is a real application layer — routing, Zod validation, and business logic — not a thin pass-through: it reads/writes Postgres directly via a `pg` connection pool, while delegating Auth verification and Storage to Supabase's own client libraries. Live group calls are the one exception to this flow — once the REST API issues a scoped LiveKit token, the mobile app connects directly to LiveKit Cloud over WebRTC, bypassing the API for the media stream itself.

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="tech-stack"></a>
## <img src="https://api.iconify.design/lucide/layers.svg?color=%232D3FE0" width="24" valign="middle"/> Tech Stack

### Mobile App (Frontend)

<div align="center">

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![React Navigation](https://img.shields.io/badge/React_Navigation-6E56CF?style=for-the-badge&logo=react&logoColor=white)](https://reactnavigation.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-002CF2?style=for-the-badge&logo=webrtc&logoColor=white)](https://livekit.io/)
[![Expo Notifications](https://img.shields.io/badge/Push_Notifications-000020?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev/versions/latest/sdk/notifications/)

</div>

- **React Native 0.81** + **TypeScript 5.9**, built and run via **Expo SDK 54** / Expo Go
- **React Navigation** (native-stack + bottom-tabs) for auth/main navigation
- **TanStack React Query** for server-state caching — screens show cached data instantly on revisit and refetch quietly in the background, rather than showing a loading spinner on every navigation
- **Axios**, wrapped in a single shared instance (`services/api.ts`) that attaches the bearer auth token to every request and normalizes error responses
- **expo-secure-store** for secure, on-device persistence of the auth token and UI preferences (theme, accent color, language)
- **LiveKit** (`@livekit/react-native`, `livekit-client`) for real-time audio/video group calls, with native WebRTC config via Expo config plugins
- **expo-notifications** for push notification registration and delivery
- A hand-rolled, type-checked **i18n layer** (`src/i18n/`) supporting English, French, and Spanish — translations are typed against a single dictionary shape, so a missing key in any language fails at compile time rather than silently falling back

### Backend

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

</div>

The backend is a standalone **Express + TypeScript** REST API (separate repository) sitting in front of Supabase — it is not a thin auto-generated pass-through, but a real application layer with its own routing, validation, and business logic:

- **Data access is hybrid:** the Supabase Admin client (`supabase-js`) handles Auth and Storage operations, while application queries run through a direct **`pg`** connection pool against the same Postgres database (`DATABASE_URL`) — giving the team full SQL control where Supabase's REST layer would be limiting.
- **Authentication** is verified per-request by forwarding the client's bearer token to Supabase Auth's `getUser()` endpoint (a network call to GoTrue) rather than verifying the JWT locally, since the signing method isn't pinned down — the resulting user is then cross-checked against the `profiles` table for suspension/deletion status before the request proceeds.
- **Schema is managed with `node-pg-migrate`** — 29 sequential, hand-written SQL migration files define every table, constraint, and schema change, giving a full auditable history rather than a single generated schema dump.
- **Request validation** is enforced with **Zod** schemas per route (e.g. `auth.schema.ts`, `resource.schema.ts`, `session.schema.ts`), rejecting malformed input before it reaches a controller.
- **Live group calls** are powered by `livekit-server-sdk`, which mints scoped room tokens on request; **push notifications** are dispatched via `expo-server-sdk`.
- **File uploads** go through `multer`, land in Supabase Storage buckets (`avatars`, `resources`), and are served back out via time-limited signed URLs rather than public links.
- Cross-cutting concerns are handled by dedicated middleware: `express-rate-limit` (auth endpoints are explicitly rate-limited), structured logging via `pino`/`pino-http`, and centralized error handling via a shared `AppError` class.
- **Testing** uses `vitest` + `supertest`, with dedicated test fixtures and a cleanup helper to reset state between runs.

> [!NOTE]
> This is the real, current backend — confirmed directly from the backend repository's source, not inferred from the mobile client.

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="getting-started"></a>
## <img src="https://api.iconify.design/lucide/rocket.svg?color=%232D3FE0" width="24" valign="middle"/> Getting Started

### Prerequisites
- Node.js >= 18.x, npm >= 9.x
- A [Supabase](https://supabase.com/) project (for the backend's `SUPABASE_URL`, anon key, and service role key)
- A local or hosted PostgreSQL connection string for the backend (`DATABASE_URL`)
- Expo Go app (iOS/Android) or a simulator, for the mobile app
- Git

### Backend setup

```bash
git clone https://github.com/asieducodes/EduSphere_backend.git
cd EduSphere_backend
npm install
```

Create a `.env` file with at minimum:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

DATABASE_URL=postgresql://user:password@host:5432/dbname

SUPABASE_STORAGE_AVATARS_BUCKET=avatars
SUPABASE_STORAGE_RESOURCES_BUCKET=resources

# Optional — required only for live group calls
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

Run migrations, then start the API:

```bash
npm run migrate   # applies db/migrations/*.sql via node-pg-migrate
npm run setup:storage   # creates the avatars/resources Supabase Storage buckets
npm run dev         # starts the Express server with tsx watch (src/index.ts)
```

> [!WARNING]
> Only ever use the **anon** key on the client. The **service role** key bypasses Row Level Security entirely and must stay server-side — it should never be committed or shipped inside the mobile app.

### Mobile app setup

```bash
git clone https://github.com/asieducodes/edusphere-knust.git
cd edusphere-knust
npm install
```

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

Point this at your local backend, or at the shared staging/production API URL. If unset, the app falls back to `http://localhost:5000/api` for local development.

Then run:

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `i` / `a` for a simulator.

> [!NOTE]
> Because this app uses LiveKit and other native modules configured via Expo config plugins, some features (live calls) may require an **Expo Dev Client** build rather than plain Expo Go. Run `npx expo run:ios` / `npx expo run:android`, or use `expo-dev-client`, if you hit native module errors in Expo Go.

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="project-structure"></a>
## <img src="https://api.iconify.design/lucide/folder-tree.svg?color=%232D3FE0" width="24" valign="middle"/> Project Structure

```
edusphere-knust/
├── App.tsx                    # App entrypoint (AuthProvider + RootNavigator)
├── src/
│   ├── components/            # Shared UI components
│   ├── constants/              # Static reference data (e.g. academic.ts)
│   ├── context/                # AuthContext — session state and auth actions
│   ├── hooks/                  # React Query hooks per domain (useGroups, useResources, useCall, ...)
│   ├── i18n/                   # en.ts / fr.ts / es.ts — typed translation dictionaries
│   ├── lib/                    # queryClient.ts — shared TanStack Query client
│   ├── navigation/              # Root, Auth, Main navigators + CustomTabBar
│   ├── screens/                 # 25 app screens
│   ├── services/                 # Domain service layer — wraps the REST API via axios
│   ├── theme/                    # Colors, spacing, typography (single source of truth)
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # authValidation.ts and other helpers
│
├── plugins/                    # Custom Expo config plugins (LiveKit native setup, APK naming)
├── assets/                     # Icons and images
└── __tests__/                  # Test suite
```

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="api-reference"></a>
## <img src="https://api.iconify.design/lucide/book-open.svg?color=%232D3FE0" width="24" valign="middle"/> API Reference

The mobile app never calls `fetch`/`axios` directly from a screen — every request goes through a domain service in `src/services/`, each wrapping a related set of REST endpoints behind a typed function. The table below lists the real, verified routes from the backend repository.

| Domain | Mobile Service File | Verified Endpoints |
|---|---|---|
| Auth | `authService.ts` | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Profile | `profileService.ts` | `GET /profile/me`, `PUT /profile/me`, `POST /profile/avatar`, `DELETE /profile/me` |
| Groups | `groupService.ts` | `GET /groups`, `GET /groups/my`, `GET /groups/recommended`, `POST /groups`, `GET /groups/:groupId`, `DELETE /groups/:groupId`, `POST /groups/:groupId/join`, `POST /groups/:groupId/leave` |
| Group Posts & Comments | `groupService.ts` | `DELETE /posts/:postId`, `DELETE /comments/:commentId` |
| Resources | `resourceService.ts` | `GET /resources` |
| Sessions | `sessionService.ts` | `GET /sessions/upcoming` |
| Live Calls | `callService.ts` | Handled by `call.controller.ts` — LiveKit room tokens |
| Ratings | `ratingService.ts` | `POST /ratings` |
| Notifications | `notificationService.ts`, `pushNotifications.ts` | `GET /notifications`, `PATCH /notifications/read-all` |
| Locations | `locationService.ts` | `GET /locations` |
| Reports | `reportService.ts` | `GET /reports/my`, `POST /reports` |
| Courses & Departments | `courseService.ts` | `GET /departments`, `GET /programmes` |
| Admin *(service ready, no UI yet)* | `adminService.ts` | `GET /admin/dashboard`, `GET /admin/users`, `PATCH /admin/users/:userId/suspend`, `GET /admin/groups`, `DELETE /admin/groups/:groupId`, `GET /admin/resources`, `GET /admin/reports`, `POST /admin/departments`, `POST /admin/locations`, `POST /admin/announcements` |

Every response follows a consistent envelope — `{ success, message, data }` — so screens read `.data` for the payload and can surface `.message` directly in toasts or banners. Auth endpoints are additionally rate-limited server-side via `express-rate-limit`.

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="team--contributors"></a>
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

<div align="right"><a href="#top"><img src="https://api.iconify.design/lucide/arrow-up.svg?color=%23F5A623" width="16" valign="middle"/> Back to top</a> · <a href="#bottom"><img src="https://api.iconify.design/lucide/arrow-down.svg?color=%23F5A623" width="16" valign="middle"/> Jump to bottom</a></div>

---

<a id="license"></a>
## <img src="https://api.iconify.design/lucide/scale.svg?color=%232D3FE0" width="24" valign="middle"/> License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

<a id="bottom"></a>
<div align="center">

<a href="#top"><img src="https://api.iconify.design/lucide/chevron-up.svg?color=%232D3FE0" width="20" valign="middle"/> Back to top</a>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B27A8,50:2D3FE0,100:3B4EF0&height=100&section=footer" width="100%"/>
</div>