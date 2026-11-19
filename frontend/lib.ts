export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export type Person = { id:number; name:string; handle:string; tagline:string; interests:string[]; vibe:string; initials:string };
export type Plan = { title:string; activity:string; suggested_time:string; location:string; estimated_budget:number; group_size:number; description:string; match_reason:string; checklist:string[]; source?:string };
export type Meetup = Plan & { id:number; status:string; unanswered:number; created_at:string };
export async function api<T>(path:string, init?:RequestInit):Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers:{'Content-Type':'application/json', ...(init?.headers||{})}, cache:'no-store' });
  if (!res.ok) { const body = await res.text(); throw new Error(body || `Request failed (${res.status})`); }
  return res.json();
}
