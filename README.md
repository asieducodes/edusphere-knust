<div align="center">

# 🎓 EduSphere

**Campus study group & resource finder for KNUST students**

[![CI](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml/badge.svg)](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-2D3FE0.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-F5A623.svg)](CONTRIBUTING.md)
[![Open Issues](https://img.shields.io/github/issues/asieducodes/edusphere-knust?color=F5A623)](https://github.com/asieducodes/edusphere-knust/issues)
[![Last Commit](https://img.shields.io/github/last-commit/asieducodes/edusphere-knust?color=2D3FE0)](https://github.com/asieducodes/edusphere-knust/commits/main)

</div>

---

## What is EduSphere?

EduSphere helps KNUST students find and organize study groups, share past questions and notes, navigate campus, and rate tutors/hosts — all in one verified-student app.

| Feature | Description |
|---|---|
| 🔐 University email verification | Restricted to `@knust.edu.gh` / `@st.knust.edu.gh` |
| 👥 Study groups | Create, join, and manage course-based study groups |
| 💬 Discussion boards | Per-group discussion threads |
| 📁 Resource sharing | Upload/download past questions and notes |
| 🗺️ Campus map | Interactive map with study locations |
| 🔔 Notifications | In-app alerts for group and resource activity |
| ⭐ Peer ratings | Rate tutors and group hosts |

## Tech Stack

- **Frontend:** React Native + TypeScript, Expo Go
- **Backend:** Supabase (Auth, Postgres, Storage, Row-Level Security)
- **Testing:** Jest + React Native Testing Library
- **CI:** GitHub Actions

## Project Structure

```
edusphere-knust/
├── App.tsx
├── src/
│   ├── components/       # Shared UI components
│   ├── context/          # AuthContext, app-wide state
│   ├── navigation/        # Root, Auth, Main navigators
│   ├── screens/           # 15 app screens
│   ├── services/          # API layer (auth, groups, resources, etc.)
│   ├── theme/              # Colors, typography
│   ├── types/               # Shared TypeScript types
│   └── utils/                # Validation helpers
├── backend/
│   └── supabase/
│       ├── migrations/      # SQL schema + RLS policies
│       ├── functions/       # Edge functions
│       └── seed/            # Seed data
├── __tests__/
│   ├── unit/
│   └── integration/
├── docs/                     # Architecture & setup guides
└── .github/workflows/         # CI pipeline
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Expo Go app (iOS/Android) or a simulator
- A [Supabase](https://supabase.com) project (free tier is fine)

### Setup

```bash
git clone https://github.com/asieducodes/edusphere-knust.git
cd edusphere-knust
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for simulator.

### Backend setup

See [`docs/BACKEND_SETUP.md`](docs/BACKEND_SETUP.md) for applying migrations and configuring Supabase Auth for KNUST email domains.

### Running tests

```bash
npm test          # run all tests
npm run test:watch
npm run test:coverage
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — app architecture & navigation flow
- [`docs/BACKEND_SETUP.md`](docs/BACKEND_SETUP.md) — Supabase schema & setup
- [`docs/CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute

## Brand

| Color | Hex | Usage |
|---|---|---|
| Royal Blue | `#2D3FE0` | Primary |
| Amber | `#F5A623` | CTAs, active states |

## License

MIT — see [LICENSE](LICENSE).
