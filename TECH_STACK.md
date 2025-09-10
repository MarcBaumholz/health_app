# Tech Stack

## Frontend
- React 18 + TypeScript
- Vite build tool
- TailwindCSS + shadcn/ui (Radix primitives)
- Zustand for state, with custom localStorage persistence
- date-fns, clsx
- Chart.js via react-chartjs-2
- sonner for toasts
- i18n-ready (initial de-DE strings)

## Backend
- FastAPI (Python 3.12)
- google-generativeai for Gemini
- pydantic for request/response models
- uvicorn
- python-dotenv for local dev

## Testing
- Frontend: Vitest, @testing-library/react, jsdom
- Backend: pytest, httpx, pytest-asyncio

## Tooling
- Prettier + ESLint (frontend)
- black + ruff (backend)
- Docker for both services
- GitHub Actions (future)