from pydantic import BaseModel, Field
from typing import Optional

class PlanRequest(BaseModel):
    prompt: str = Field(min_length=5, max_length=1000)
    city: str = "Kozhikode"

class PlanResponse(BaseModel):
    title: str
    activity: str
    suggested_time: str
    location: str
    estimated_budget: int
    group_size: int
    description: str
    match_reason: str
    checklist: list[str]
    source: str = "demo"

class CreateMeetupRequest(PlanResponse):
    pass

class RecoveryResponse(BaseModel):
    meetup_id: int
    status: str
    headline: str
    explanation: str
    actions: list[str]
    revised_plan: Optional[str] = None
