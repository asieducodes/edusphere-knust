<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2D3FE0,100:F5A623&height=180&section=header&text=EduSphere&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Campus%20Study%20Group%20%26%20Resource%20Finder%20—%20KNUST&descAlignY=58&descSize=18" width="100%" alt="EduSphere banner"/>

[![CI](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml/badge.svg)](https://github.com/asieducodes/edusphere-knust/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com)

[![Open Issues](https://img.shields.io/github/issues/asieducodes/edusphere-knust?color=F5A623&style=flat-square)](https://github.com/asieducodes/edusphere-knust/issues)
[![Last Commit](https://img.shields.io/github/last-commit/asieducodes/edusphere-knust?color=2D3FE0&style=flat-square)](https://github.com/asieducodes/edusphere-knust/commits/main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-F5A623.svg?style=flat-square)](CONTRIBUTING.md)

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
- **Backend:** FastAPI (Python) + PostgreSQL, SQLAlchemy + Alembic migrations
- **File Storage:** Cloudinary (past questions, notes, avatars)
- **Testing:** Jest + React Native Testing Library (frontend), Pytest (backend)
- **CI:** GitHub Actions

## Project Structure

```
edusphere-knust/
├── App.tsx
├── src/                        # React Native frontend
│   ├── components/       # Shared UI components
│   ├── context/          # AuthContext, app-wide state
│   ├── navigation/        # Root, Auth, Main navigators
│   ├── screens/           # 15 app screens
│   ├── services/          # API layer (auth, groups, resources, etc.)
│   ├── theme/              # Colors, typography
│   ├── types/               # Shared TypeScript types
│   └── utils/                # Validation helpers
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/routes/            # auth, users, groups, resources, sessions, ratings, notifications
│   │   ├── core/                    # config, database session
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── services/                   # Cloudinary storage, business logic
│   │   └── main.py                      # FastAPI app entrypoint
│   ├── alembic/                    # DB migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml            # API + Postgres for local dev
├── __tests__/
│   ├── unit/
│   └── integration/
├── docs/                     # Architecture & setup guides
└── .github/workflows/         # CI pipeline
```

## Getting Started

### Prerequisites
- Node.js ≥ 18, npm ≥ 9
- Python ≥ 3.12
- Docker (recommended, for local Postgres) or a standalone PostgreSQL 16 instance
- Expo Go app (iOS/Android) or a simulator
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) for file storage

### Frontend setup

```bash
git clone https://github.com/asieducodes/edusphere-knust.git
cd edusphere-knust
npm install
cp .env.example .env   # then fill in your API base URL
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for simulator.

### Backend setup

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL + Cloudinary credentials
docker compose up -d   # from repo root: starts Postgres + the API together
# — or, running the API locally without Docker —
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

API docs (Swagger) are then available at `http://localhost:8000/docs`.

See [`docs/BACKEND_SETUP.md`](docs/BACKEND_SETUP.md) for schema details and KNUST email domain restriction logic.

### Running tests

```bash
npm test          # run all tests
npm run test:watch
npm run test:coverage
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — app architecture & navigation flow
- [`docs/BACKEND_SETUP.md`](docs/BACKEND_SETUP.md) — FastAPI/Postgres schema & setup
- [`docs/CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute

## Brand

| Color | Hex | Usage |
|---|---|---|
| Royal Blue | `#2D3FE0` | Primary |
| Amber | `#F5A623` | CTAs, active states |

## License

MIT — see [LICENSE](LICENSE).
