# AFTERHOURS — AI-powered social coordination

An independent portfolio project inspired by the public Misfits hiring brief. It is not affiliated with Misfits and does not represent its actual product.

## What works
- Discover sample people by shared interests.
- Generate a meetup plan from natural language.
- Create and list meetups.
- Simulate unanswered RSVPs.
- Run an Anti-Ghosting recovery recommendation.
- Works without an LLM key using a deterministic fallback.
- Optional OpenAI-compatible model integration on the backend.

## Architecture
- `frontend/`: Next.js App Router, TypeScript, CSS, Framer Motion, Lucide icons.
- `backend/`: FastAPI, SQLite, Pydantic, optional OpenAI SDK.
- Browser talks only to FastAPI. Keep model/API secrets on the backend.

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # optional; leave OPENAI_API_KEY blank for demo mode
uvicorn app.main:app --reload --port 8000
```
Open http://localhost:8000/docs to inspect the API.

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Open http://localhost:3000.

## Optional LLM setup
Set `OPENAI_API_KEY` and `OPENAI_MODEL` in `backend/.env`. Set `FRONTEND_ORIGIN` to your deployed frontend origin when hosting the API. The API uses the OpenAI SDK on the server. If the key is absent or the model call fails, it falls back to deterministic planning. Never put the key in `frontend/.env.local` or client-side code.

## Demo flow for a recruiter
1. Open the dashboard and browse the sample people.
2. In the AI Planner, enter: `I want to play badminton this Sunday morning with 3 people, under ₹500 each.`
3. Generate the plan and create the meetup.
4. Open Anti-Ghosting, select a meetup, simulate unanswered RSVPs, then run recovery.
5. Explain how the system uses structured intent, tool-like functions, explicit user approval, and a deterministic fallback.

## Deployment notes
- Deploy `backend/` as a Python web service with start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT` and root directory `backend`.
- Set `FRONTEND_ORIGIN` to the exact deployed frontend origin. Set `OPENAI_API_KEY` only if using a model.
- Deploy `frontend/` as a Next.js app with root directory `frontend` and `NEXT_PUBLIC_API_URL` set to the backend URL.
- For persistent hosted data, attach a persistent disk for SQLite or migrate to managed PostgreSQL.

## API endpoints
- `GET /health`
- `GET /api/discover`
- `GET /api/meetups`
- `POST /api/plan`
- `POST /api/meetups`
- `POST /api/meetups/{meetup_id}/simulate-no-response`
- `POST /api/meetups/{meetup_id}/recover`

## Product and safety notes
- All people and venues are fictional seed data. Do not use the demo to contact real people.
- Meetup creation is a local demo action; it does not book venues, charge money, or send invitations.
- The AI suggests plans. Users approve before a meetup is created.
- Add authentication, consent, moderation, privacy controls, rate limits, and real venue verification before any public launch.

## Seven-day build schedule
| Day | Focus | Exit criteria |
|---|---|---|
| 1 | Product definition, flows, visual system | Four core screens and user journey agreed |
| 2 | Frontend shell and responsive UI | Dashboard, discovery, planner, recovery views |
| 3 | FastAPI and data model | Health, discovery, meetup CRUD working |
| 4 | AI planning | Structured intent and fallback/model provider |
| 5 | Anti-Ghosting | Simulated RSVP failure and recovery suggestions |
| 6 | Polish and testing | Mobile QA, loading/error states, demo data reset |
| 7 | Deploy and tell the story | Public URL, GitHub README, 90-second demo |

## Suggested portfolio evidence
- A 60–90 second screen recording showing the full flow.
- A short case study: problem, product hypothesis, architecture, trade-offs, test observations, next steps.
- Screenshots of the discovery, planner, meetup, and recovery states.
- Be transparent about simulated data and what is not production-ready.
