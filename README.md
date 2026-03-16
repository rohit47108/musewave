# MuseWave

MuseWave is a full-stack interactive soundscape studio built as a Next.js 15 frontend and a FastAPI backend. It pairs a browser-native ambient audio engine with reactive WebGL visuals, persistent public share links, and embed-ready public scenes.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, Tone.js, Zustand
- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Deployment: Vercel for the frontend and Render for the API plus PostgreSQL

## Workspace Layout

- [`frontend`](/C:/aBlueCube/frontend): App Router UI, immersive editor, public player, embed page, OG image generation
- [`backend`](/C:/aBlueCube/backend): FastAPI API, persistence, scene composition, share links, and public scene retrieval
- [`shared`](/C:/aBlueCube/shared): Shared scene contract and documentation

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Frontend Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Backend Environment

Create `backend/.env`:

```bash
APP_NAME=MuseWave API
APP_ENV=development
APP_VERSION=1.0.0
PUBLIC_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///./musewave.db
EXPORTS_ENABLED=false
EXPORT_STORAGE=local
LOCAL_STORAGE_DIR=./storage
EXPORT_POLL_SECONDS=5
AUTO_CREATE_TABLES=true
```

## Product Flows

1. Users blend up to three moods and sculpt intensity, reverb, stereo spread, filters, and visual energy in the editor.
2. The browser audio engine renders the scene in real time while the Three.js canvas responds to analyser energy.
3. Saving creates a canonical scene in the API and returns a pretty share slug plus embed code.
4. Shared scenes reopen with the same composition logic, public player route, and OG preview image.

## Deployment

### Vercel

1. Import the repo and set the root directory to `frontend`.
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Set `NEXT_PUBLIC_API_BASE_URL` to the public Render API URL.

### Render

1. Create a PostgreSQL database.
2. Deploy the web service from [`render.yaml`](/C:/aBlueCube/render.yaml).
3. Run `alembic upgrade head` before first start and before each schema-changing deploy.
4. Set shared environment variables from `backend/.env`.
5. Set `EXPORTS_ENABLED=false` for the share-only launch.

## Accessibility and Performance

- All interactive controls are keyboard reachable and labeled.
- Reduced-motion users get a low-animation visual fallback automatically.
- The WebGL canvas degrades to a CSS-only hero if the device is low-power or motion-constrained.
- The audio engine is user-gesture gated to satisfy browser autoplay restrictions.
- Production schema changes should flow through Alembic migrations; local dev can still use `AUTO_CREATE_TABLES=true`.

## Notes About Assets

This implementation ships with a procedural sound engine and a documented asset manifest rather than bundled licensed stems. The browser player and share routes already support layered scene-driven composition, so downloadable exports can be added later without changing the core saved-scene API.
