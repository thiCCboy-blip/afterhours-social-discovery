import os, json, re
from dotenv import load_dotenv
from .schemas import PlanResponse
load_dotenv()

SYSTEM_PROMPT = """You are AFTERHOURS, a practical social-planning assistant. Turn a user's vague intention into a safe, realistic meetup proposal. Return ONLY valid JSON with keys: title, activity, suggested_time, location, estimated_budget, group_size, description, match_reason, checklist. Do not claim to have booked venues, contacted people, checked live availability, or verified real-world details. Use the supplied city. If details are missing, make conservative suggestions and clearly label them as proposals. Never pressure users to meet strangers; recommend public places and user approval."""

def fallback_plan(prompt: str, city: str) -> dict:
    p = prompt.lower()
    if any(x in p for x in ['badminton', 'football', 'cricket', 'basketball', 'run', 'cycling', 'sport']):
        activity, location, budget = 'Casual badminton session', f'Public sports court in {city}', 350
        title = 'Rally, then recharge'
        reason = 'A low-pressure activity makes it easier for new people to connect.'
    elif any(x in p for x in ['coffee', 'cafe', 'chat', 'talk']):
        activity, location, budget = 'Coffee and conversation', f'A busy public cafe in {city}', 250
        title = 'Coffee with strangers (soon-to-be friends)'
        reason = 'A short, public meetup has a simple start and an easy exit.'
    elif any(x in p for x in ['music', 'gig', 'concert', 'art', 'museum']):
        activity, location, budget = 'Creative afternoon / live-music discovery', f'A public cultural venue in {city}', 500
        title = 'Make a little noise'
        reason = 'A shared experience gives the group something natural to talk about.'
    else:
        activity, location, budget = 'Small-group social hangout', f'A well-lit public meeting spot in {city}', 300
        title = 'A plan beats another maybe'
        reason = 'A simple, time-boxed meetup lowers the effort of saying yes.'
    size_match = re.search(r'\b([2-8])\s*(?:people|friends|of us)\b', p)
    group_size = int(size_match.group(1)) if size_match else 4
    money_match = re.search(r'(?:under|below|budget|₹|rs\.?\s*)(\d{2,5})', p)
    if money_match: budget = min(budget, int(money_match.group(1)))
    when = 'Sunday, 10:00 AM (suggested)' if 'sunday' in p else ('Saturday, 4:00 PM (suggested)' if 'saturday' in p else 'This weekend, 4:00 PM (suggested)')
    return {
        'title': title, 'activity': activity, 'suggested_time': when, 'location': location,
        'estimated_budget': budget, 'group_size': group_size,
        'description': f'A {group_size}-person, low-pressure plan based on: “{prompt[:150]}”. Confirm the details with the group before making commitments.',
        'match_reason': reason,
        'checklist': ['Confirm the time with everyone', 'Choose and verify a public venue', 'Share transport and accessibility needs', 'Reconfirm attendance on the day']
    }

async def create_plan(prompt: str, city: str) -> dict:
    key = os.getenv('OPENAI_API_KEY')
    if key:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=key)
            response = await client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4.1-mini'),
                messages=[{'role':'system','content':SYSTEM_PROMPT}, {'role':'user','content':f'City: {city}\nUser request: {prompt}'}],
                response_format={'type':'json_object'}, temperature=0.6
            )
            data = json.loads(response.choices[0].message.content)
            validated = PlanResponse(**data, source='llm')
            return validated.model_dump()
        except Exception:
            pass
    data = fallback_plan(prompt, city)
    data['source'] = 'demo'
    return data

def recovery_plan(meetup: dict) -> dict:
    unanswered = max(1, int(meetup.get('unanswered', 0)))
    return {
        'meetup_id': meetup['id'], 'status': 'recovery_proposed',
        'headline': 'The plan is wobbling. Keep it easy.',
        'explanation': f'{unanswered} RSVP(s) are still unanswered in this simulation. Rather than guilt people, reduce the coordination friction and offer a clear choice.',
        'actions': [
            'Send one friendly check-in with a simple YES / NOT THIS TIME choice.',
            'Offer one backup time instead of reopening the whole discussion.',
            'Keep the plan viable with the confirmed people; do not require a perfect headcount.'
        ],
        'revised_plan': f"Keep ‘{meetup['title']}’ at {meetup['suggested_time']} as the primary option; propose one alternate slot and ask for confirmation."
    }
