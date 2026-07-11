# Backend Setup (FastAPI + PostgreSQL + Cloudinary)

## Prerequisites
- Python ≥ 3.12
- Docker (recommended) or a standalone PostgreSQL 16 instance
- A free [Cloudinary](https://cloudinary.com) account

## Local setup

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — defaults to the Docker Compose Postgres service; change if using a standalone DB.
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard under Settings > API Keys.
- `SECRET_KEY` — any long random string, used to sign JWTs.

### Option A — Docker (recommended)

From the repo root:
```bash
docker compose up -d
```
This starts Postgres and the FastAPI app together. API available at `http://localhost:8000`, docs at `http://localhost:8000/docs`.

### Option B — Run locally without Docker

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Database migrations

Migrations are managed with Alembic (`backend/alembic/`). After changing a model in `app/models/`:
```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## KNUST email domain restriction

Signup is restricted to `@knust.edu.gh` and `@st.knust.edu.gh` — enforced in `app/api/routes/auth.py` via `settings.ALLOWED_EMAIL_DOMAINS`, mirroring the same check used client-side in `src/utils/authValidation.ts`.

## API routes

Routers are split by domain under `app/api/routes/`: `auth`, `users`, `groups`, `resources`, `sessions`, `ratings`, `notifications` — each mounted under `/api/<domain>` in `app/main.py`. Route bodies are currently stubs (`501 Not Implemented`) pending the models/schemas being filled in — see the project backlog for what's next.

## File storage (Cloudinary)

`app/services/storage.py` wraps `cloudinary.uploader` for uploading/deleting past questions, notes, and avatars. Uploaded files return a `secure_url` and `public_id` that get stored against the relevant row in Postgres (e.g. `resources.file_url`, `resources.cloudinary_public_id`).

## Running tests

```bash
cd backend
pytest
```
