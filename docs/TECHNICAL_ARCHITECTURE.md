\# AFTERHOURS

\## Technical Architecture



\*\*Project:\*\* AFTERHOURS  

\*\*Architecture:\*\* Next.js frontend + FastAPI backend  

\*\*Status:\*\* Functional prototype  

\*\*Repository:\*\* https://github.com/thiCCboy-blip/afterhours-social-discovery



\---



\## 1. System Overview



AFTERHOURS is a web application that connects interest-based profile discovery with AI-assisted meetup planning and lightweight coordination workflows.



The system uses a separated frontend and backend architecture.



\- The frontend is responsible for the user interface, navigation, client-side state and browser persistence.

\- The backend exposes REST-style HTTP endpoints for discovery data, meetup planning, meetup storage and recovery recommendations.

\- SQLite stores meetup records.

\- An optional OpenAI integration generates structured meetup proposals. A deterministic fallback planner is used when the model is unavailable.



\### High-level architecture



```text

&#x20;                 USER

&#x20;                   |

&#x20;                   v

&#x20;      +---------------------------+

&#x20;      |       Next.js App         |

&#x20;      |                           |

&#x20;      | React + TypeScript        |

&#x20;      |                           |

&#x20;      | Discover                  |

&#x20;      | Saved People              |

&#x20;      | Planner                   |

&#x20;      | Meetups                   |

&#x20;      | Anti-Ghosting             |

&#x20;      +-------------+-------------+

&#x20;                    |

&#x20;                    | HTTP / JSON

&#x20;                    |

&#x20;                    v

&#x20;      +---------------------------+

&#x20;      |       FastAPI API         |

&#x20;      |                           |

&#x20;      | /api/discover             |

&#x20;      | /api/plan                 |

&#x20;      | /api/meetups              |

&#x20;      | /api/meetups/{id}/recover |

&#x20;      +------+------+-------------+

&#x20;             |      |

&#x20;             |      |

&#x20;      +------+      +----------------+

&#x20;      |                              |

&#x20;      v                              v

+----------------+           +-------------------+

|    SQLite      |           | Planning Agent    |

|                |           |                   |

| Meetup records |           | Optional OpenAI   |

| RSVP state     |           | Deterministic     |

| Status         |           | fallback planner  |

+----------------+           +-------------------+

```



\---



\## 2. Frontend Architecture



\### Technology



\- Next.js 16

\- React 19

\- TypeScript

\- CSS

\- Framer Motion

\- Lucide React



\### Main entry points



| File | Responsibility |

|---|---|

| `frontend/app/page.tsx` | Main application interface and client-side workflows |

| `frontend/app/layout.tsx` | Root layout and application metadata |

| `frontend/app/globals.css` | Global styling |

| `frontend/app/lib.ts` | API client and shared TypeScript types |

| `frontend/next.config.ts` | Next.js configuration |



The main page is a client-rendered React experience. It uses React state and effects to manage navigation, profile data, meetup data, selected interests, saved profiles and planning interactions.



\### Client-side state



The application uses React hooks:



\- `useState` for interface and workflow state.

\- `useEffect` for initial data loading and browser persistence.

\- `useMemo` for derived data such as ranked profiles and filtered results.



The frontend loads discovery profiles and meetups from the backend when the application starts.



If the initial API request fails, the interface retains its local fallback profile data so discovery can still be explored.



\### API client



`frontend/app/lib.ts` contains the shared API helper.



The backend base URL is configured through:



```env

NEXT\_PUBLIC\_API\_URL=http://localhost:8000

```



If the variable is not set, the frontend defaults to:



```text

http://localhost:8000

```



The helper sends JSON requests, disables fetch caching for these API calls, checks HTTP response status and returns parsed JSON.



\---



\## 3. Interest Matching and Recommendation Logic



The current recommendation system is implemented in the frontend.



It is based on Jaccard similarity between two interest sets.



Let:



\- A = the user's selected interests.

\- B = the profile's interests.

\- A ∩ B = interests shared by both.

\- A ∪ B = all distinct interests across both sets.



The score is:



\\\[

J(A,B)=\\frac{|A\\cap B|}{|A\\cup B|}\\times100

\\]



The implementation normalises interest strings by trimming whitespace and converting them to lowercase before comparison.



\### Example



User interests:



```text

design, music, food

```



Profile interests:



```text

design, food, photography

```



Shared interests:



```text

design, food

```



Combined distinct interests:



```text

design, music, food, photography

```



Result:



```text

2 / 4 × 100 = 50%

```



The application sorts profiles by this score in recommended mode.



Additional discovery controls include:



\- Interest category filtering.

\- Recommended and all-people feed modes.

\- Minimum match-score filtering.

\- Saved-only filtering.



\*\*Important:\*\* This is an explainable interest-overlap heuristic. It is not a trained machine-learning recommendation model and does not measure actual interpersonal compatibility.



\---



\## 4. Backend Architecture



\### Technology



\- Python

\- FastAPI

\- Pydantic

\- SQLite

\- Python dotenv

\- OpenAI Python SDK



\### Backend entry point



`backend/app/main.py` creates the FastAPI application and registers the CORS middleware.



The application initialises the SQLite database on startup.



The backend is divided into three principal modules:



| File | Responsibility |

|---|---|

| `backend/app/main.py` | API routes, application setup and request handling |

| `backend/app/agent.py` | Planning logic, optional LLM integration and recovery recommendations |

| `backend/app/database.py` | SQLite connection, table creation and meetup persistence |

| `backend/app/schemas.py` | Pydantic request and response models |



\### API endpoints



| Method | Endpoint | Function |

|---|---|---|

| GET | `/health` | Returns API health and demo mode information |

| GET | `/api/discover` | Returns sample profiles |

| GET | `/api/discover?interest=music` | Filters sample profiles by interest |

| GET | `/api/meetups` | Retrieves stored meetups |

| POST | `/api/plan` | Generates a structured meetup proposal |

| POST | `/api/meetups` | Creates a meetup record |

| POST | `/api/meetups/{meetup\_id}/simulate-no-response` | Simulates two unanswered RSVPs |

| POST | `/api/meetups/{meetup\_id}/recover` | Generates recovery recommendations |



Interactive API documentation is available through FastAPI's `/docs` interface.



\---



\## 5. Planning Agent and LLM Integration



The planning workflow is implemented in:



`backend/app/agent.py`



The system accepts a natural-language prompt and a city through the planning request.



The request is validated using the `PlanRequest` Pydantic model.



The planning function follows two execution paths.



\### Path A: Optional OpenAI model



When `OPENAI\_API\_KEY` is configured, the backend:



1\. Creates an asynchronous OpenAI client.

2\. Sends a system prompt and the user's planning request.

3\. Requests a JSON-formatted response.

4\. Parses the returned JSON.

5\. Validates the result against `PlanResponse`.

6\. Labels the response source as `llm`.



The default configured model is `gpt-4.1-mini`, overridable using `OPENAI\_MODEL`.



\### Path B: Deterministic fallback



If the API key is unavailable or the model request or validation fails, the system uses `fallback\_plan()`.



The fallback examines keywords in the user's prompt and selects a predefined activity category, location suggestion, budget and recommendation.



It also attempts to extract group size and budget information from the prompt.



The fallback labels the response source as `demo`.



\### Planning output



Both paths return a structured proposal containing:



\- Title

\- Activity

\- Suggested time

\- Location suggestion

\- Estimated budget

\- Group size

\- Description

\- Match reason

\- Checklist

\- Response source



The model is instructed not to claim that venues have been booked, people contacted or live availability checked.



\*\*Architecture decision:\*\* The deterministic fallback keeps the prototype usable without depending on successful LLM access.



\*\*Limitation:\*\* The fallback is keyword-driven and does not provide general natural-language understanding.



\---



\## 6. Meetup Persistence



Meetup data is stored in SQLite through:



`backend/app/database.py`



The database table contains:



| Field | Purpose |

|---|---|

| `id` | Primary key |

| `title` | Meetup title |

| `activity` | Proposed activity |

| `suggested\_time` | Suggested time |

| `location` | Suggested location |

| `estimated\_budget` | Estimated budget |

| `group\_size` | Proposed group size |

| `description` | Meetup description |

| `match\_reason` | Explanation for the activity |

| `checklist` | JSON-serialised checklist |

| `status` | Current meetup state |

| `unanswered` | Simulated unanswered RSVP count |

| `created\_at` | Record creation timestamp |



The database path can be configured through:



```env

DATABASE\_PATH=afterhours.db

```



If this variable is not supplied, the application uses `afterhours.db` relative to the backend process's working directory.



The database helper provides operations to:



\- Initialise the table.

\- Create meetup records.

\- Retrieve individual meetups.

\- List meetups.

\- Update unanswered RSVP state.

\- Mark a meetup as having a recovery proposal.



\---



\## 7. Recovery Workflow



The recovery feature demonstrates how a product might respond when meetup coordination loses momentum.



The current workflow is simulated.



\### Sequence



```text

User creates meetup

&#x20;       |

&#x20;       v

Meetup stored in SQLite

&#x20;       |

&#x20;       v

User simulates unanswered RSVPs

&#x20;       |

&#x20;       v

Backend updates meetup state

&#x20;       |

&#x20;       v

User requests recovery

&#x20;       |

&#x20;       v

Recovery recommendations generated

&#x20;       |

&#x20;       v

Meetup status updated

```



The simulation sets the unanswered RSVP count to two and changes the status to `needs\_attention`.



The recovery function proposes:



\- One friendly follow-up with a simple response choice.

\- One alternative time.

\- Continuing with confirmed participants where practical.



The backend returns a recovery proposal and updates the meetup status to `recovery\_proposed`.



No actual notifications, messages or invitations are sent.



\---



\## 8. Browser Persistence



The frontend uses browser local storage for two user-specific values:



| Key | Stored information |

|---|---|

| `afterhours-saved-people` | Saved profile identifiers |

| `afterhours-my-interests` | Selected personal interests |



This allows those values to persist across browser refreshes on the same browser profile.



They are not synchronised across devices and are not linked to authenticated user accounts.



\---



\## 9. Configuration and Environment Variables



\### Frontend



```env

NEXT\_PUBLIC\_API\_URL=http://localhost:8000

```



\### Backend



```env

OPENAI\_API\_KEY=your\_api\_key

OPENAI\_MODEL=gpt-4.1-mini

FRONTEND\_ORIGIN=http://localhost:3000

DATABASE\_PATH=afterhours.db

```



All backend configuration values are optional where the code supplies defaults.



\- `OPENAI\_API\_KEY` enables the optional model path.

\- `OPENAI\_MODEL` overrides the default model name.

\- `FRONTEND\_ORIGIN` configures the allowed CORS origin.

\- `DATABASE\_PATH` changes the SQLite database location.



API keys must remain on the backend and must never be committed to the public repository.



\---



\## 10. Security and Production Considerations



The current project is a prototype. Before production deployment, I would address:



1\. Authentication and authorisation for user-specific data.

2\. Input validation, rate limiting and abuse protection.

3\. Secure secret management.

4\. Production database configuration and backups.

5\. Persistent storage for deployments with ephemeral filesystems.

6\. CORS configuration for actual deployment domains.

7\. Logging, monitoring and error observability.

8\. Privacy, consent and profile moderation.

9\. Real invitation and RSVP integrations.

10\. Automated tests for API and planning workflows.



The current SQLite implementation has no user ownership or authentication layer. Meetup records are shared through the backend API.



The current recovery feature is a demonstration of product logic rather than a live messaging integration.



\---



\## 11. Technical Trade-offs



| Decision | Benefit | Limitation |

|---|---|---|

| Next.js frontend | Component-based interactive experience | Client-side state is concentrated in the main page |

| FastAPI backend | Simple typed API and rapid development | Production operational controls still needed |

| Jaccard matching | Explainable and lightweight | Does not model real compatibility |

| Optional LLM | Flexible proposal generation | Depends on external model availability and cost |

| Deterministic fallback | Demo remains usable without LLM | Limited keyword-based understanding |

| SQLite | Simple persistent meetup storage | Not configured for multi-user production scale |

| Browser local storage | Simple preference persistence | Browser-specific, no account synchronisation |



\---



\## 12. Summary



AFTERHOURS uses a deliberately straightforward architecture to explore a connected social coordination experience.



The frontend manages discovery and user interactions. FastAPI provides planning and meetup workflows. SQLite stores meetup records. An optional LLM path generates structured plans, with deterministic fallback behavior when model generation is unavailable.



The architecture prioritises explainability and a working end-to-end prototype over production complexity.



\*\*The central technical idea:\*\* combine explainable discovery, structured planning and lightweight coordination into one connected product experience.



