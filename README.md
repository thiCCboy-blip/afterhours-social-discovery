# AFTERHOURS 🌙
### Find your frequency. Meet your people.

**AFTERHOURS** is an independent product-building experiment exploring how interest-based discovery and AI-assisted planning can help people turn shared interests into real-world meetups.

Instead of stopping at discovering people, AFTERHOURS explores the journey from finding common ground to proposing a plan, organising a meetup, and recovering when coordination goes quiet.

> An independent portfolio project inspired by a social-product problem space. Not affiliated with, endorsed by, or representative of Misfits.

---

## The Product

Finding people with shared interests is only the beginning. Turning that connection into an actual plan introduces another set of challenges: deciding what to do, coordinating logistics, getting responses, and keeping the plan alive.

AFTERHOURS explores this journey through four connected experiences:

1. **Discover** people through shared interests and profile information.
2. **Plan** activities using a natural-language planning assistant.
3. **Meet up** by turning a proposed plan into a saved meetup draft.
4. **Recover** when simulated RSVPs go unanswered, with practical next-step recommendations.

## Features

### 1. Interest-based discovery
- Browse fictional sample profiles.
- Filter profiles by interests.
- Calculate an interest-overlap score using Jaccard similarity.
- Show shared interests as an explanation for the score.
- Rank profiles by interest overlap.
- Save profiles and revisit them later.
- Persist saved profiles and personal interests in browser local storage.

**Matching note:** The current compatibility score is a transparent set-overlap calculation. It is not a trained recommendation model or a measure of personal compatibility.

### 2. AI-assisted meetup planning
- Describe an activity in natural language.
- Generate a structured meetup proposal.
- Produce suggested activity, time, location, estimated budget, group size, description and checklist.
- Optionally use an OpenAI model through the backend.
- Fall back to a deterministic planning function when the model is unavailable.

The planning assistant proposes ideas. It does not book venues, verify live availability, contact people or make payments.

### 3. Meetup management
- Convert a generated proposal into a meetup draft.
- Store meetup records in SQLite.
- Retrieve previously created meetup drafts.
- Track basic meetup status and unanswered RSVP counts.

### 4. Anti-Ghosting recovery
- Simulate unanswered RSVPs for a meetup.
- Generate practical recovery suggestions.
- Recommend low-pressure follow-ups and alternate times.
- Update the meetup's recovery status.

This is a simulated coordination workflow. It does not send messages or contact real participants.

---

## Product walkthrough

The intended demo journey:

1. Open Discover and browse the sample profiles.
2. Explore shared interests and save a profile.
3. Open the planner and enter a request such as:

   `I want to play badminton this Sunday morning with 3 people, under ₹500 each.`

4. Generate a meetup proposal.
5. Review the details and create a meetup draft.
6. Open the Meetups section.
7. Open Anti-Ghosting, simulate unanswered RSVPs and generate a recovery recommendation.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js |
| UI library | React |
| Language | TypeScript |
| Styling | CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Data validation | Pydantic |
| Database | SQLite |
| Optional model integration | OpenAI Python SDK |

## Architecture

```text
┌──────────────────────────────┐
│       Next.js Frontend       │
│                              │
│ Discover · Planner · Meetups │
│       Anti-Ghosting          │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│        FastAPI Backend       │
│                              │
│ Discovery · Planning         │
│ Meetup Management · Recovery │
└───────┬──────────────┬───────┘
        │              │
        ▼              ▼
┌──────────────┐  ┌────────────────┐
│    SQLite    │  │ Optional OpenAI│
│ Meetup data  │  │ Model provider │
└──────────────┘  └────────────────┘
```

The frontend communicates with the backend over HTTP. Optional model credentials are configured on the backend rather than exposed in client-side code.

---

## Run Locally

### Prerequisites

- Node.js and npm
- Python 3.10 or newer
- Git

### 1. Clone the repository

```bash
git clone https://github.com/thiCCboy-blip/afterhours-social-discovery.git
cd afterhours-social-discovery
```

### 2. Start the backend

```powershell
cd backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

python -m uvicorn app.main:app --reload --port 8000
```

The backend API will be available at:

- API: http://localhost:8000
- Interactive API documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 3. Start the frontend

Open another terminal:

```powershell
cd frontend

npm install
npm run dev
```

Open:

http://localhost:3000

The frontend defaults to `http://localhost:8000` for its backend API. To use a different backend URL, configure `NEXT_PUBLIC_API_URL` in the frontend environment.

### 4. Optional OpenAI integration

The backend can optionally use the OpenAI SDK for model-assisted planning.

Configure these environment variables in `backend/.env`:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
FRONTEND_ORIGIN=http://localhost:3000
```

Without a valid model configuration, the backend uses its deterministic fallback planner.

**Security:** Never commit `.env` files, API keys or other credentials to GitHub.

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/api/discover` | Retrieve sample profiles |
| GET | `/api/meetups` | List saved meetup drafts |
| POST | `/api/plan` | Generate a meetup proposal |
| POST | `/api/meetups` | Create a meetup draft |
| POST | `/api/meetups/{meetup_id}/simulate-no-response` | Simulate unanswered RSVPs |
| POST | `/api/meetups/{meetup_id}/recover` | Generate recovery recommendations |

---

## Product Decisions and Limitations

AFTERHOURS is a prototype, not a production-ready social network.

Current implementation boundaries:

- Profiles are fictional sample data.
- Interest matching uses Jaccard similarity rather than machine learning.
- Personal interests and saved profiles are stored in browser local storage.
- Meetup records are stored in SQLite.
- RSVP non-response is simulated.
- Recovery recommendations are generated by backend logic; no messages are sent.
- The optional LLM integration is used for planning, not for the interest-match score.
- Authentication, real invitations, moderation and production privacy controls are not implemented.
- Meetup suggestions are not verified venue bookings.

These boundaries are intentional parts of the prototype's scope and should be considered before production use.

## Future Roadmap

- User authentication and individual profiles.
- Real user-generated interests and discovery preferences.
- More advanced and explainable recommendation models.
- Consent-based invitations and RSVP workflows.
- Real-time meetup coordination.
- Moderation, reporting and privacy controls.
- Production database and deployment architecture.
- Usability testing with real users.

---
