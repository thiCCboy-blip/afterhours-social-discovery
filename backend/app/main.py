from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from .database import init_db, list_meetups, get_meetup, create_meetup, set_unanswered, mark_recovered
from .schemas import PlanRequest, CreateMeetupRequest
from .agent import create_plan, recovery_plan

app = FastAPI(title='AFTERHOURS API', version='1.0.0', description='AI-assisted social coordination demo')
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000')], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.on_event('startup')
def startup(): init_db()

PEOPLE = [
 {'id':1,'name':'Maya','handle':'@mayamakes','tagline':'Designing things. Finding good dumplings.','interests':['design','food','art'],'vibe':'Curious maker','initials':'M'},
 {'id':2,'name':'Ishan','handle':'@ishan.wav','tagline':'Gig hunter and amateur photographer.','interests':['music','photography','coffee'],'vibe':'Culture scout','initials':'I'},
 {'id':3,'name':'Zoya','handle':'@zoyaruns','tagline':'Runs slow. Laughs loud.','interests':['running','fitness','books'],'vibe':'Outside person','initials':'Z'},
 {'id':4,'name':'Dev','handle':'@devbuilds','tagline':'Badminton, side projects, spicy food.','interests':['badminton','technology','food'],'vibe':'Friendly competitor','initials':'D'},
 {'id':5,'name':'Rhea','handle':'@rheareads','tagline':'Bookshops, indie films, long walks.','interests':['books','films','walking'],'vibe':'Quiet explorer','initials':'R'},
 {'id':6,'name':'Kabir','handle':'@kabiroutside','tagline':'Weekend hikes and new playlists.','interests':['hiking','music','photography'],'vibe':'Weekend catalyst','initials':'K'}
]

@app.get('/health')
def health(): return {'status':'ok','product':'AFTERHOURS','mode':'demo-with-optional-llm'}

@app.get('/api/discover')
def discover(interest: str | None = None):
    if not interest: return {'people': PEOPLE}
    q = interest.lower()
    return {'people':[p for p in PEOPLE if any(q in x for x in p['interests'])]}

@app.get('/api/meetups')
def meetups(): return {'meetups': list_meetups()}

@app.post('/api/plan')
async def plan(req: PlanRequest):
    return await create_plan(req.prompt, req.city)

@app.post('/api/meetups')
def add_meetup(req: CreateMeetupRequest):
    data = req.model_dump(exclude={'source'})
    return {'meetup': create_meetup(data)}

@app.post('/api/meetups/{meetup_id}/simulate-no-response')
def simulate_no_response(meetup_id: int):
    meetup = get_meetup(meetup_id)
    if not meetup: raise HTTPException(404, 'Meetup not found')
    return {'meetup': set_unanswered(meetup_id, 2)}

@app.post('/api/meetups/{meetup_id}/recover')
def recover(meetup_id: int):
    meetup = get_meetup(meetup_id)
    if not meetup: raise HTTPException(404, 'Meetup not found')
    result = recovery_plan(meetup)
    mark_recovered(meetup_id)
    return result
