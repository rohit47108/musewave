# MuseWave

MuseWave is a full-stack interactive soundscape studio built as a Next.js 15 frontend and a FastAPI backend. It pairs a browser-native ambient audio engine with reactive WebGL visuals, persistent public share links, and offline WAV export jobs.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, Tone.js, Zustand
- Backend: FastAPI, SQLAlchemy, PostgreSQL, boto3-compatible R2 uploads, optional `pedalboard` mastering
- Deployment: Vercel for the frontend, Render for the API and export worker, Cloudflare R2 for generated assets

## Workspace Layout

- [`frontend`](/C:/aBlueCube/frontend): App Router UI, immersive editor, public player, embed page, OG image generation
- [`backend`](/C:/aBlueCube/backend): FastAPI API, persistence, scene composition, export queue, background worker
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
uvicorn app.main:app --reload
```

### Export Worker

```bash
cd backend
.venv\Scripts\activate
python -m app.workers.export_worker
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
EXPORT_STORAGE=local
LOCAL_STORAGE_DIR=./storage
EXPORT_POLL_SECONDS=5
R2_BUCKET=
R2_REGION=auto
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_BASE_URL=
```

## Product Flows

1. Users blend up to three moods and sculpt intensity, reverb, stereo spread, filters, and visual energy in the editor.
2. The browser audio engine renders the scene in real time while the Three.js canvas responds to analyser energy.
3. Saving creates a canonical scene in the API and returns a pretty share slug plus embed code.
4. Exports enqueue a background job that renders a WAV and uploads it to local storage or Cloudflare R2.

## Deployment

### Vercel

1. Import the repo and set the root directory to `frontend`.
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Set `NEXT_PUBLIC_API_BASE_URL` to the public Render API URL.

### Render

1. Create a PostgreSQL database.
2. Deploy the web service from [`render.yaml`](/C:/aBlueCube/render.yaml).
3. Set shared environment variables from `backend/.env`.
4. Deploy the worker service from the same `render.yaml`.

### Cloudflare R2

1. Create a bucket and API token.
2. Set the R2 environment variables in Render.
3. Switch `EXPORT_STORAGE=r2`.

## Accessibility and Performance

- All interactive controls are keyboard reachable and labeled.
- Reduced-motion users get a low-animation visual fallback automatically.
- The WebGL canvas degrades to a CSS-only hero if the device is low-power or motion-constrained.
- The audio engine is user-gesture gated to satisfy browser autoplay restrictions.

## Notes About Assets

This implementation ships with a procedural sound engine and a documented asset manifest rather than bundled licensed stems. The browser player and export renderer already support layered scene-driven composition, so a curated stem library can be added later without changing the API contract.
