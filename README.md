# GesundWerk (Local-first)

A local-first health/productivity app. All user data is stored in the browser via localStorage. A minimal Python backend powers AI recommendations only.

## Key Points
- No login, no server DB; clearing site data erases progress
- Tabs: Dashboard, Wissen, Verlauf, Journal, Erfolge, Einstellungen
- AI Assistant calls backend `/recommendations` (Gemini)

## Dev Setup
- Use Python venv for backend. Node 20+ for frontend.
- See `PLANNING.md` and `TECH_STACK.md`.

### Backend (FastAPI)
- Create venv: `python3 -m venv .venv && source .venv/bin/activate`
- Install: `pip install -U pip` then `pip install -r <(python - <<'PY'\nfrom pathlib import Path; import tomllib;\nprint('\n'.join(t for t in tomllib.loads(Path('backend/pyproject.toml').read_text())['project']['dependencies']))\nPY
)` or `pip install fastapi uvicorn[standard] pydantic python-dotenv google-generativeai`
- Copy env: `cp backend/.env.example backend/.env` and set `GEMINI_API_KEY`
- Run: `uvicorn app:app --app-dir backend --reload`

### Frontend (Vite React TS)
- Install deps: `cd frontend && npm i`
- Dev: `npm run dev`
- Test: `npm test`

## Monorepo Layout
- `frontend/` React + TS app
- `backend/` FastAPI service
- Project docs at repo root: `README.md`, `PLANNING.md`, `TASK.md`, `TECH_STACK.md`

## Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions:

- **Live App**: https://marcbaumholz.github.io/health_app/
- **Repository**: https://github.com/MarcBaumholz/health_app

### GitHub Pages Setup
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically build and deploy on every push to main

## Next Steps
- Scaffold frontend & backend
- Implement state schema & tests
- Build features per `TASK.md`