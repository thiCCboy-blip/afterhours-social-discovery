\# AFTERHOURS

\## Product Case Study

\### Turning shared interests into real-world connections



\*\*Project:\*\* AFTERHOURS  

\*\*Category:\*\* Social discovery / AI-assisted coordination  

\*\*Role:\*\* Independent product builder  

\*\*Platform:\*\* Web application  

\*\*Status:\*\* Functional prototype  

\*\*Repository:\*\* https://github.com/thiCCboy-blip/afterhours-social-discovery



\---



\## 1. Overview



AFTERHOURS explores a simple product question:



\*\*What if discovering people was only the beginning, and the product helped turn that discovery into an actual plan?\*\*



Many social products make it easy to browse profiles and interact online. However, moving from shared interests to a real-world activity introduces additional coordination work: deciding what to do, agreeing on a time, choosing a location, and getting people to commit.



AFTERHOURS brings these steps into one connected experience.



The prototype combines interest-based discovery, personalised recommendations, AI-assisted meetup planning, meetup management and a recovery workflow for unanswered RSVPs.



\## 2. Problem framing



The product was built around three related friction points.



\### Discovery friction



People may share interests but have no easy way to identify one another or find a reason to connect.



\### Planning friction



Even when people want to meet, turning an informal intention into a practical activity requires several decisions.



\### Coordination friction



A proposed plan can lose momentum when participants do not respond or when the group cannot settle on a time.



These are the problems AFTERHOURS explores. They are product hypotheses, not findings from a completed user-research study.



\## 3. Product vision



The product is designed around a connected journey:



\*\*Discover → Connect → Plan → Meet → Recover\*\*



Rather than treating discovery and event planning as unrelated features, AFTERHOURS explores how each stage can support the next.



The intended experience is lightweight: find common ground, suggest something practical, and make coordination easier.



\## 4. Key product decisions



\### Decision 1: Make shared interests visible



The Discover experience uses profile interests to explain why two people might have something in common.



The prototype calculates a Jaccard similarity score:



\\\[

J(A,B)=\\frac{|A\\cap B|}{|A\\cup B|}\\times100

\\]



Where:



\- A represents the user's selected interests.

\- B represents a profile's interests.

\- The intersection represents shared interests.

\- The union represents all distinct interests across both sets.



This creates an explainable overlap score instead of an opaque compatibility label.



\*\*Trade-off:\*\* Interest overlap is easy to understand and implement, but it does not measure personality, trust, chemistry or actual social compatibility.



\### Decision 2: Keep discovery actionable



The application includes profile details, saved profiles and interest filtering.



The intention is to help users move beyond passive browsing and retain profiles they may want to revisit.



Saved profiles and personal interests are persisted using browser local storage.



\*\*Trade-off:\*\* This supports a simple prototype without authentication or a user database, but saved information is browser-specific and is not synchronised across devices.



\### Decision 3: Use AI to reduce planning friction



The planning assistant accepts a natural-language description and returns a structured meetup proposal.



The proposal can include:



\- Activity

\- Suggested time

\- Location suggestion

\- Estimated budget

\- Group size

\- Description

\- Reason for the activity

\- Preparation checklist



The backend optionally uses an OpenAI model to generate the proposal.



If model configuration is unavailable or the model request fails, the application uses a deterministic fallback planner.



This fallback makes the prototype usable without requiring a successful model call.



\*\*Trade-off:\*\* The fallback improves reliability for a demo, but it is based on predefined rules rather than a flexible understanding of every request.



\### Decision 4: Treat coordination as part of the product



A generated plan can be saved as a meetup draft.



The application stores meetup records in SQLite, making it possible to retrieve previously created plans.



The prototype also includes an unanswered-RSVP simulation and a recovery recommendation workflow.



Rather than encouraging repeated pressure on participants, the recovery logic proposes a friendly check-in, an alternative time and a smaller viable group.



\*\*Trade-off:\*\* This demonstrates the coordination concept without implementing real invitations, messaging or RSVP integrations.



\## 5. Experience architecture



The product is organised into five primary areas.



| Area | Purpose |

|---|---|

| Discover | Browse profiles and shared interests |

| Saved People | Revisit saved profiles |

| Make a Plan | Generate a meetup proposal |

| Your Plans | Review saved meetup drafts |

| Anti-Ghosting | Explore recovery recommendations |



The experience connects profile discovery with practical planning and coordination.



\## 6. Technical implementation



\### Frontend



Built with Next.js, React and TypeScript.



The frontend handles:

\- Application navigation

\- Profile discovery and details

\- Interest-based ranking

\- Saved profile interactions

\- Meetup planning interface

\- Meetup and recovery views

\- Local browser persistence



Framer Motion is used for interface animation.



\### Backend



Built with Python and FastAPI.



The backend handles:

\- Discovery profile responses

\- Planning requests

\- Optional model integration

\- Deterministic planning fallback

\- Meetup creation and retrieval

\- Simulated unanswered RSVP state

\- Recovery recommendation generation



\### Data storage



SQLite stores meetup records.



Browser local storage stores the user's saved profiles and selected interests.



\### High-level architecture



```text

User

&#x20;|

&#x20;v

Next.js / React / TypeScript

&#x20;|

&#x20;| HTTP / JSON

&#x20;v

FastAPI backend

&#x20;|

&#x20;+--------------------+

&#x20;|                    |

&#x20;v                    v

Planning logic     SQLite

&#x20;|                 Meetup records

&#x20;+--------------------+

&#x20;|

&#x20;v

Optional OpenAI model

&#x20;|

&#x20;v

Structured meetup proposal

```



\## 7. Important limitations



AFTERHOURS is a functional prototype, not a production-ready social platform.



The current implementation has the following boundaries:



\- Discovery uses six fictional sample profiles.

\- Matching is based on interest overlap, not a trained recommendation model.

\- Saved profiles and personal interests are browser-local.

\- Meetup planning is a proposal-generation workflow, not a booking service.

\- Venue availability and real-world details are not verified.

\- Meetup coordination uses simulated RSVP non-response.

\- Recovery recommendations do not send messages.

\- Authentication, real user accounts, moderation and production privacy controls are not implemented.



These limitations define the current prototype scope and the next areas of product development.



\## 8. What I would build next



If developing AFTERHOURS beyond the prototype, I would prioritise:



1\. \*\*User identity and trust:\*\* Authentication, real profiles, privacy controls and reporting.

2\. \*\*Better discovery:\*\* User feedback, richer preferences and improved recommendation quality.

3\. \*\*Real coordination:\*\* Consent-based invitations, RSVP responses and notifications.

4\. \*\*Location-aware planning:\*\* Verified venues, distance and availability integrations.

5\. \*\*Product validation:\*\* Usability testing to understand whether the discovery-to-meetup journey solves a meaningful user problem.



I would validate the core journey before adding more features.



\## 9. What this project demonstrates



AFTERHOURS brings together several areas of product development:



\- Translating a product problem into an end-to-end experience.

\- Designing explainable personalisation.

\- Building a frontend with interactive state and persistence.

\- Creating API-driven backend workflows.

\- Integrating optional LLM functionality with a deterministic fallback.

\- Thinking through product limitations, reliability and future development.



\## 10. Closing thought



AFTERHOURS is an exploration of a social product where the outcome is not another interaction on a screen, but a practical reason for people to meet.



\*\*Find your frequency. Meet your people.\*\*



\---



\*Independent portfolio project. Sample profiles and simulated coordination workflows are used for demonstration purposes.\*



