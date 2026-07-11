<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2D3FE0,100:F5A623&height=200&section=header&text=EduSphere&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=Campus%20Study%20Group%20and%20Resource%20Finder%20%E2%80%94%20KNUST&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-File_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
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
- **Axios** for API communication, with automatic JWT refresh
- **expo-secure-store** for secure token storage

### Backend
- **FastAPI** (Python) with Uvicorn ASGI server
- **SQLAlchemy** ORM with Alembic migrations
- **PostgreSQL 16** relational database
- **JWT (python-jose)** for stateless authentication
- **bcrypt** for password hashing
- **Cloudinary** for academic file storage (past questions, notes, avatars)

> [!IMPORTANT]
> This project began as a web app concept (UI first designed in Google Stitch) before pivoting to a native mobile build. There is no browser-based frontend — the app runs on iOS/Android via Expo Go, not `localhost:5173` in a browser.

---

## <img src="https://api.iconify.design/lucide/rocket.svg?color=%232D3FE0" width="24" valign="middle"/> Getting Started

### Prerequisites
- Node.js >= 18.x, npm >= 9.x
- Python >= 3.12
- PostgreSQL >= 16 (or Docker, recommended)
- Expo Go app (iOS/Android) or a simulator
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/asieducodes/edusphere-knust.git
cd edusphere-knust
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

Or, with Docker (starts Postgres + API together), from the repo root:
```bash
docker compose up -d
```

---

### 3. Mobile app setup

```bash
# from repo root
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API base URL (see note below on device networking)

npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `i` / `a` for a simulator.

> [!WARNING]
> **Device networking:** if you're running the backend on your laptop and testing on a physical phone, `localhost` in `.env` won't reach your laptop from the phone. Use your laptop's LAN IP instead (e.g. `http://192.168.1.42:8000/api`), and make sure both devices are on the same network.

---

### 4. Environment variables

**Backend `backend/.env`**
```env
ENV=development
SECRET_KEY=your-super-secret-jwt-key
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/edusphere
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Mobile app `.env`**
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## <img src="https://api.iconify.design/lucide/folder-tree.svg?color=%232D3FE0" width="24" valign="middle"/> Project Structure

```
edusphere-knust/
├── App.tsx                          # Mobile app entrypoint
├── src/                             # React Native application
│   ├── components/                  # Shared UI components
│   ├── context/                     # AuthContext, app-wide state
│   ├── navigation/                  # Root, Auth, Main navigators + CustomTabBar
│   ├── screens/                     # 15 app screens
│   ├── services/                    # api.js, auth.js, tokenStorage.js, + domain services
│   ├── theme/                       # Colors, spacing, typography
│   ├── types/                       # Shared TypeScript types
│   └── utils/                       # authValidation.ts and other helpers
│
├── backend/                         # FastAPI application
│   ├── app/
│   │   ├── api/routes/              # auth, users, groups, resources, sessions, ratings, notifications
│   │   ├── core/                    # config.py, database.py
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   └── services/                # storage.py (Cloudinary), business logic
│   ├── tests/                       # Pytest test suites
│   ├── alembic/                     # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                            # Architecture & setup guides
├── __tests__/                       # Jest unit + integration tests
├── docker-compose.yml               # API + Postgres for local dev
└── .github/workflows/               # CI pipeline
```

---

## <img src="https://api.iconify.design/lucide/book-open.svg?color=%232D3FE0" width="24" valign="middle"/> API Documentation

Once the backend is running, full interactive API docs are available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register with KNUST email |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/refresh` | Refresh an expired access token |
| `POST` | `/api/auth/verify-email` | Verify a KNUST student email |
| `GET` | `/api/users/me` | Get authenticated user profile |
| `PATCH` | `/api/users/me` | Update authenticated user profile |
| `GET` | `/api/groups` | List and filter all study groups |
| `POST` | `/api/groups` | Create a new study group |
| `GET` | `/api/resources` | List uploaded resources |
| `POST` | `/api/resources` | Upload a resource (Cloudinary) |
| `GET` | `/api/sessions` | List scheduled study sessions |
| `POST` | `/api/ratings` | Submit a peer rating |
| `GET` | `/api/notifications` | List in-app notifications |

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
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2D3FE0,100:F5A623&height=100&section=footer" width="100%"/>
</div>