\# AFTERHOURS

\## Product Decisions \& Design Rationale



\*\*Project:\*\* AFTERHOURS  

\*\*Role:\*\* Independent Product Builder  

\*\*Status:\*\* Functional prototype



\---



\## 1. Product Philosophy



AFTERHOURS explores a product idea: social discovery should help people move beyond browsing profiles and towards meaningful real-world activities.



The product is organised around a simple progression:



\*\*Discover → Find Common Ground → Plan → Meet → Recover\*\*



The decisions below explain how this idea influenced the prototype.



\## 2. Decision Log



\### Decision 01: Connect discovery with real-world action



\*\*Decision:\*\* Build discovery and meetup planning as connected parts of one product rather than separate experiences.



\*\*Reasoning:\*\* Finding someone with shared interests is useful, but the next step is finding a practical reason to connect.



\*\*Implementation:\*\* The application combines profile discovery, saved people, natural-language planning and meetup management.



\*\*Trade-off:\*\* A broader product journey creates more interface and state-management complexity than a single-purpose discovery application.



\*\*Future improvement:\*\* Validate whether users actually move from discovering a profile to proposing an activity.



\---



\### Decision 02: Make recommendations explainable



\*\*Decision:\*\* Use shared interests to calculate and explain profile match scores.



\*\*Reasoning:\*\* Users should be able to understand why a profile appears relevant.



\*\*Implementation:\*\* Jaccard similarity measures the overlap between the user's selected interests and a profile's interests.



\*\*Trade-off:\*\* The calculation is transparent and lightweight, but it cannot represent personality, social chemistry or deeper compatibility.



\*\*Future improvement:\*\* Test additional signals, such as activity preferences and explicit user feedback, while keeping recommendations understandable.



\---



\### Decision 03: Keep user preferences lightweight



\*\*Decision:\*\* Store selected interests and saved profile identifiers in browser local storage.



\*\*Reasoning:\*\* A prototype can provide persistent interactions without requiring authentication or a user-account backend.



\*\*Implementation:\*\* The frontend persists:

\- `afterhours-saved-people`

\- `afterhours-my-interests`



\*\*Trade-off:\*\* Preferences persist in the same browser profile but are not synchronised across devices or accounts.



\*\*Future improvement:\*\* Introduce authenticated accounts and server-side preference storage.



\---



\### Decision 04: Use natural language for meetup planning



\*\*Decision:\*\* Let users describe an activity in their own words instead of requiring them to complete a long planning form.



\*\*Reasoning:\*\* People often begin with an intention rather than a fully specified event.



\*\*Implementation:\*\* The planning endpoint accepts a natural-language prompt and returns a structured meetup proposal.



\*\*Trade-off:\*\* Model-generated suggestions may require validation and can be inconsistent.



\*\*Future improvement:\*\* Add clarification questions when important planning information is missing.



\---



\### Decision 05: Provide a deterministic fallback



\*\*Decision:\*\* Keep a rule-based fallback planner when optional model generation is unavailable.



\*\*Reasoning:\*\* The main planning experience should remain demonstrable even without a successful external model request.



\*\*Implementation:\*\* The backend can use an OpenAI model and falls back to keyword-based planning logic when model configuration or generation fails.



\*\*Trade-off:\*\* The fallback is predictable but has limited natural-language understanding.



\*\*Future improvement:\*\* Add better request validation, clearer fallback messaging and automated tests for both execution paths.



\---



\### Decision 06: Treat coordination failure as a product problem



\*\*Decision:\*\* Include a recovery workflow for unanswered meetup RSVPs.



\*\*Reasoning:\*\* Creating a plan does not guarantee that people will respond or that coordination will succeed.



\*\*Implementation:\*\* The prototype simulates unanswered RSVPs and generates recovery recommendations such as a friendly follow-up, an alternative time and a smaller viable group.



\*\*Trade-off:\*\* Simulation demonstrates the workflow but does not prove that the recommendations improve real-world attendance.



\*\*Future improvement:\*\* Validate recovery suggestions with users before integrating actual notifications or messaging.



\---



\### Decision 07: Use simple persistence for the prototype



\*\*Decision:\*\* Use SQLite for meetup records and browser local storage for user preferences.



\*\*Reasoning:\*\* These choices allow the prototype to demonstrate persistent workflows without introducing unnecessary infrastructure.



\*\*Implementation:\*\*

\- SQLite stores meetup records.

\- Local storage stores saved profile identifiers and selected interests.



\*\*Trade-off:\*\* This architecture does not provide account-level data isolation, cross-device synchronisation or production-grade multi-user infrastructure.



\*\*Future improvement:\*\* Introduce authenticated user ownership, a production database and appropriate data-access controls.



\---



\## 3. Product Trade-off Summary



| Product decision | Immediate benefit | Current limitation |

|---|---|---|

| Interest-based discovery | Understandable recommendations | Limited compatibility signals |

| Jaccard similarity | Explainable scoring | Not a trained recommendation model |

| Browser persistence | Simple user experience | Browser-specific storage |

| Natural-language planning | Flexible input | Model output requires validation |

| Deterministic fallback | Planning remains available | Keyword-driven behaviour |

| Meetup recovery | Demonstrates coordination thinking | Simulated responses |

| SQLite | Lightweight persistence | Limited production scalability |



\## 4. What I Would Validate Before Expanding



The next phase should focus on product validation rather than adding features indiscriminately.



\### Hypothesis 1: Shared interests create useful discovery



Would people find interest overlap helpful when deciding whom to connect with?



\*\*Validation:\*\* Conduct usability sessions and observe how people interpret match scores and shared-interest explanations.



\### Hypothesis 2: Natural-language planning reduces friction



Can users describe an activity more easily than they can complete a structured planning form?



\*\*Validation:\*\* Compare task completion, clarification needs and perceived effort across both approaches.



\### Hypothesis 3: Recovery suggestions help plans regain momentum



Do people find a friendly follow-up or alternative time useful when responses are delayed?



\*\*Validation:\*\* Test recovery recommendations using realistic coordination scenarios.



These are proposed experiments. They have not yet been conducted.



\## 5. What I Would Prioritise Next



My next priorities would be:



1\. Validate the core discovery-to-meetup journey.

2\. Improve trust, authentication and user privacy.

3\. Test recommendation quality with real user feedback.

4\. Improve planning reliability and clarification behaviour.

5\. Replace simulated coordination with consent-based real workflows.



I would prioritise evidence from user behaviour over adding more features.



\---



\## 6. Closing Reflection



AFTERHOURS is an exploration of how a social product can connect discovery with action.



The most important product decision was to treat finding people, planning activities and coordinating meetups as parts of one connected experience.



The prototype provides a foundation for testing that idea. Its limitations also make the next product questions clear.



\*\*Find your frequency. Meet your people.\*\*



