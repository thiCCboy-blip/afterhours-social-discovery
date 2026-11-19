'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowUpRight, AudioLines, Bot, CalendarDays, Check, ChevronRight, Compass, Flame, Heart, MapPin, MessageCircle, Plus, Radar, RefreshCw, Send, Sparkles, Users, X } from 'lucide-react';
import { api, Meetup, Person, Plan } from './lib';

type Tab = 'discover'|'saved'|'planner'|'meetups'|'recovery';
const interests = ['all','music','badminton','design','food','books','photography'];
const fallbackPeople:Person[] = [
 {id:1,name:'Maya',handle:'@mayamakes',tagline:'Designing things. Finding good dumplings.',interests:['design','food','art'],vibe:'Curious maker',initials:'M'},
 {id:2,name:'Ishan',handle:'@ishan.wav',tagline:'Gig hunter and amateur photographer.',interests:['music','photography','coffee'],vibe:'Culture scout',initials:'I'},
 {id:3,name:'Zoya',handle:'@zoyaruns',tagline:'Runs slow. Laughs loud.',interests:['running','fitness','books'],vibe:'Outside person',initials:'Z'},
 {id:4,name:'Dev',handle:'@devbuilds',tagline:'Badminton, side projects, spicy food.',interests:['badminton','technology','food'],vibe:'Friendly competitor',initials:'D'},
 {id:5,name:'Rhea',handle:'@rheareads',tagline:'Bookshops, indie films, long walks.',interests:['books','films','walking'],vibe:'Quiet explorer',initials:'R'},
 {id:6,name:'Kabir',handle:'@kabiroutside',tagline:'Weekend hikes and new playlists.',interests:['hiking','music','photography'],vibe:'Weekend catalyst',initials:'K'}
];
const samplePrompt = 'I want to play badminton this Sunday morning with 3 people, under ₹500 each.';

function getMatchDetails(person: Person, myInterests: string[]) {
  const normalizedMine = myInterests.map(value =>
    value.trim().toLowerCase()
  );

  const normalizedPerson = person.interests.map(value =>
    value.trim().toLowerCase()
  );

  const shared = person.interests.filter((value, index) =>
    normalizedMine.includes(normalizedPerson[index])
  );

  const allInterests = new Set([
    ...normalizedMine,
    ...normalizedPerson
  ]);

  const score = normalizedMine.length === 0
    ? 0
    : Math.round((shared.length / allInterests.size) * 100);

  return { score, shared };
}


export default function Home(){
 const [tab,setTab]=useState<Tab>('discover'); const [people,setPeople]=useState<Person[]>(fallbackPeople); const [meetups,setMeetups]=useState<Meetup[]>([]); const [interest,setInterest]=useState('all'); const [prompt,setPrompt]=useState(samplePrompt); const [plan,setPlan]=useState<Plan|null>(null); const [loading,setLoading]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [recovery,setRecovery]=useState<any>(null); const [activeMeetup,setActiveMeetup]=useState<number|null>(null); const [toast,setToast]=useState('');const [selectedPerson,setSelectedPerson]=useState<Person|null>(null);const [savedPeople,setSavedPeople]=useState<number[]>([]);
const [savedPeopleLoaded,setSavedPeopleLoaded]=useState(false);
const [myInterests, setMyInterests] = useState<string[]>([
  'technology',
  'AI',
  'design',
  'music',
  'books',
  'photography',
  'food',
  'badminton',
  'fitness',
  'gaming',
  'coffee',
  'hiking',
  'travel',
  'films',
  'art',
  'running'
]);

const [myInterestsLoaded, setMyInterestsLoaded] = useState(false);

const [minMatchScore, setMinMatchScore] = useState(0);
const [savedOnly, setSavedOnly] = useState(false);
const [feedMode, setFeedMode] = useState<'recommended' | 'all'>('recommended');
 const current=useMemo(()=>meetups.find(m=>m.id===activeMeetup)||meetups[0],[meetups,activeMeetup]);
 async function refresh(){ try { const [p,m]=await Promise.all([api<{people:Person[]}>('/api/discover'),api<{meetups:Meetup[]}>('/api/meetups')]); setPeople(p.people);setMeetups(m.meetups); } catch { /* fallback keeps the UI explorable */ } }
 useEffect(()=>{refresh()},[]);
useEffect(() => {
  try {
    const stored = localStorage.getItem('afterhours-saved-people');

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (
        Array.isArray(parsed) &&
        parsed.every(id => Number.isInteger(id))
      ) {
        setSavedPeople(parsed as number[]);
      }
    }
  } catch (error) {
    console.error('Could not load saved people:', error);
  } finally {
    setSavedPeopleLoaded(true);
  }
}, []);
useEffect(() => {
  if (!savedPeopleLoaded) return;

  try {
    localStorage.setItem(
      'afterhours-saved-people',
      JSON.stringify(savedPeople)
    );
  } catch (error) {
    console.error('Could not save shortlist:', error);
  }
}, [savedPeople, savedPeopleLoaded]);
// LOAD PERSONAL INTERESTS
useEffect(() => {
  try {
    const stored = localStorage.getItem('afterhours-my-interests');

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (
        Array.isArray(parsed) &&
        parsed.every(item => typeof item === 'string')
      ) {
        setMyInterests(parsed);
      }
    }
  } catch (error) {
    console.error('Could not load interests:', error);
  } finally {
    setMyInterestsLoaded(true);
  }
}, []);

// SAVE PERSONAL INTERESTS
useEffect(() => {
  if (!myInterestsLoaded) return;

  try {
    localStorage.setItem(
      'afterhours-my-interests',
      JSON.stringify(myInterests)
    );
  } catch (error) {
    console.error('Could not save interests:', error);
  }
}, [myInterests, myInterestsLoaded]);


const filtered = interest === 'all'
  ? people
  : people.filter(p =>
      p.interests.some(
        item => item.toLowerCase() === interest.toLowerCase()
      )
    );

const rankedPeople = useMemo(() => {
  return filtered
    .map(person => ({
      ...person,
      match: getMatchDetails(person, myInterests)
    }))
    .sort((a, b) => b.match.score - a.match.score);
}, [filtered, myInterests]);

const displayPeople = useMemo(() => {
  const orderedPeople = feedMode === 'recommended'
    ? rankedPeople
    : filtered.map(person => ({
        ...person,
        match: getMatchDetails(person, myInterests)
      }));

  return orderedPeople.filter(person =>
    person.match.score >= minMatchScore &&
    (!savedOnly || savedPeople.includes(person.id))
  );
}, [
  feedMode,
  rankedPeople,
  filtered,
  myInterests,
  minMatchScore,
  savedOnly,
  savedPeople
]);

 function notify(s:string){setToast(s);window.setTimeout(()=>setToast(''),2600)}
 async function generate(){setLoading(true);setError('');setPlan(null);try{const p=await api<Plan>('/api/plan',{method:'POST',body:JSON.stringify({prompt,city:'Kozhikode'})});console.log('AFTERHOURS PLAN RESPONSE:', p);
setPlan(p);}catch(e){setError(e instanceof Error?e.message:'Could not generate a plan')}finally{setLoading(false)}}
 async function create(){if(!plan)return;setBusy(true);try{const r=await api<{meetup:Meetup}>('/api/meetups',{method:'POST',body:JSON.stringify(plan)});await refresh();setActiveMeetup(r.meetup.id);setTab('meetups');notify('Meetup draft created. No invitations were sent.')}catch(e){setError(e instanceof Error?e.message:'Could not create meetup')}finally{setBusy(false)}}
 async function simulate(){if(!current)return;setBusy(true);try{await api(`/api/meetups/${current.id}/simulate-no-response`,{method:'POST'});await refresh();setActiveMeetup(current.id);setRecovery(null);notify('Demo RSVP state updated')}catch(e){setError(e instanceof Error?e.message:'Simulation failed')}finally{setBusy(false)}}
 async function recover(){if(!current)return;setBusy(true);try{const r=await api(`/api/meetups/${current.id}/recover`,{method:'POST'});setRecovery(r);await refresh();setActiveMeetup(current.id)}catch(e){setError(e instanceof Error?e.message:'Recovery failed')}finally{setBusy(false)}}
const nav=[
  {id:'discover' as Tab,label:'The radar',icon:Radar},
  {id:'saved' as Tab,label:'Saved people',icon:Heart},
  {id:'planner' as Tab,label:'Make a plan',icon:Sparkles},
  {id:'meetups' as Tab,label:'Your plans',icon:CalendarDays},
  {id:'recovery' as Tab,label:'Anti-ghosting',icon:Heart}
];
 return <main className="shell">
  <aside className="sidebar"><a className="brand" href="#top"><span className="brand-mark">A<span>✳</span></span><span>AFTER<br/>HOURS<span className="brand-dot">.</span></span></a><div className="side-label">YOUR SOCIAL OS</div><nav>{nav.map(n=><button key={n.id} className={`nav-item ${tab===n.id?'active':''}`} onClick={()=>{setTab(n.id);setError('')}}><n.icon size={17}/><span>{n.label}</span>{n.id==='meetups'&&meetups.length>0&&<i>{meetups.length}</i>}
{n.id==='saved'&&savedPeople.length>0&&<i>{savedPeople.length}</i>}</button>)}</nav><div className="sidebar-bottom"><div className="status-line"><span className="pulse"/> AI CORE ONLINE</div><div className="profile-mini"><div className="avatar avatar-you">AR</div><div><b>YOU, FOR NOW</b><small>Kozhikode · demo mode</small></div><button title="Demo profile"><Plus size={16}/></button></div></div></aside>
  <section className="main-area"><header className="topbar"><div className="crumb">AFTERHOURS <span>/</span> {nav.find(n=>n.id===tab)?.label.toUpperCase()}</div><div className="top-actions"><span className="location"><MapPin size={13}/> KOZHIKODE, IN</span><span className="live-pill"><span/> LIVE PLAYGROUND</span></div></header>
  <div className="content" id="top"><div className="eyebrow"><span className="eyebrow-star">✳</span> THE INTERNET IS NOT A PLACE TO HANG OUT.</div><AnimatePresence mode="wait"><motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.2}}>
  {tab==='discover'&&<>
   <div className="hero-row"><div><h1>Less scrolling.<br/><em>More living.</em></h1><p className="hero-copy">Your next favourite people are probably one plan away. Find your frequency, then get out there.</p></div><div className="hero-stamp"><span>IRL</span><small>IS THE<br/>NEW URL</small><AudioLines size={26}/></div></div>
   <div className="section-head"><div><div className="kicker">01 / THE RADAR</div><h2>People in your orbit<span className="orange">.</span></h2></div><span className="count">{displayPeople.length.toString().padStart(2,'0')} SIGNALS FOUND</span></div>
   <div className="chips">{interests.map(i=><button key={i} onClick={()=>setInterest(i)} className={interest===i?'chip selected':'chip'}>{i==='all'?'✳ Everything':`#${i}`}</button>)}</div>
<div className="interest-preferences">
  <div className="kicker">YOUR SIGNAL / PERSONAL INTERESTS</div>
  <p>Select what you genuinely enjoy. Your recommendations will use these preferences.</p>

  <div className="chips">
    {[
      'technology', 'AI', 'design', 'music',
      'books', 'photography', 'food', 'badminton',
      'fitness', 'gaming', 'coffee', 'hiking',
      'travel', 'films', 'art', 'running'
    ].map(item => (
      <button
        key={item}
        className={myInterests.includes(item) ? 'chip selected' : 'chip'}
        onClick={() => {
          setMyInterests(current =>
            current.includes(item)
              ? current.filter(value => value !== item)
              : [...current, item]
          );
        }}
      >
        {myInterests.includes(item) ? '✓ ' : '+ '}
        #{item}
      </button>
    ))}
  </div>

  <small>{myInterests.length} interests selected</small>
</div>

<div className="discovery-controls">
  <div className="kicker">DISCOVERY CONTROLS</div>

  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    marginTop: '12px'
  }}>
    <button
      className={feedMode === 'recommended' ? 'chip selected' : 'chip'}
      onClick={() => setFeedMode('recommended')}
    >
      ✳ Recommended
    </button>

    <button
      className={feedMode === 'all' ? 'chip selected' : 'chip'}
      onClick={() => setFeedMode('all')}
    >
      All people
    </button>

    <button
      className={savedOnly ? 'chip selected' : 'chip'}
      onClick={() => setSavedOnly(value => !value)}
    >
      ♥ Saved only {savedOnly ? '✓' : ''}
    </button>
  </div>

  <div style={{ marginTop: '18px', maxWidth: '420px' }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    }}>
      <label
  htmlFor="match-filter"
  className="kicker"
style={{
    fontSize: '13px',
    letterSpacing: '1.5px',
    fontWeight: 700
  }}
>
  MINIMUM MATCH SCORE
</label>
      <strong>{minMatchScore}%</strong>
    </div>

    <input
      id="match-filter"
      type="range"
      min="0"
      max="100"
      step="5"
      value={minMatchScore}
      onChange={e => setMinMatchScore(Number(e.target.value))}
      style={{ width: '100%', accentColor: '#f07843' }}
    />
  </div>

  <p style={{ marginTop: '12px' }}>
    Showing <strong>{displayPeople.length}</strong> of {filtered.length} people
  </p>
</div>

   <div className="people-grid">{displayPeople.map((p,i)=><motion.article key={p.id} className={`person-card card-tone-${i%4}`} onClick={()=>setSelectedPerson(p)} style={{cursor:'pointer'}} whileHover={{y:-5,rotate:i%2?-.5:.5}} transition={{type:'spring',stiffness:280}}><div className="person-top"><span className="person-index">SIGNAL_0{p.id}</span><button
  className={`icon-button ${savedPeople.includes(p.id) ? 'saved' : ''}`}
  aria-label={savedPeople.includes(p.id) ? `Unsave ${p.name}` : `Save ${p.name}`}
  onClick={(e) => {
    e.stopPropagation();
    setSavedPeople(current =>
      current.includes(p.id)
        ? current.filter(id => id !== p.id)
        : [...current, p.id]
    );
    notify(savedPeople.includes(p.id) ? `Removed ${p.name} from shortlist` : `Saved ${p.name} to shortlist`);
  }}
>
  <Heart size={16} fill={savedPeople.includes(p.id) ? 'currentColor' : 'none'} />
</button></div><div className="avatar-big">{p.initials}</div><div className="person-meta"><span className="vibe">{p.vibe}</span><h3>{p.name}<span className="verified">✳</span></h3><p>{p.tagline}</p></div>
<div className="match-details">
  <div className="match-score">
    <span>INTEREST MATCH</span>
    <strong>{p.match.score}%</strong>
  </div>

  <p>
    {p.match.shared.length > 0
      ? `You both like ${p.match.shared.join(', ')}.`
      : 'Explore their interests and find something new in common.'}
  </p>
</div>
<div className="tag-row">{p.interests.slice(0,3).map(t=><span key={t}>#{t}</span>)}</div><button className="connect" onClick={(e)=>{e.stopPropagation();setPrompt(`Help me plan a low-pressure ${p.interests[0]} hangout with people who share this interest.`);setTab('planner')}}>MAKE A PLAN <ArrowUpRight size={15}/></button></motion.article>)}</div>
   <div className="manifesto"><div className="manifesto-icon"><Flame/></div><div><div className="kicker">A SMALL REMINDER</div><h3>Good chemistry deserves<br/>a calendar invite.</h3></div><button onClick={()=>setTab('planner')}>MAKE IT HAPPEN <ArrowUpRight size={16}/></button></div>
  </>}
{tab==='saved'&&<>
  <div className="page-intro">
    <div className="kicker">02 / YOUR SHORTLIST</div>
    <h1>Your people.<br/><em>Your orbit.</em></h1>
    <p>People who caught your attention. Pick up where the connection starts.</p>
  </div>

  <div className="section-head">
    <div>
      <div className="kicker">SAVED CONNECTIONS</div>
      <h2>Your shortlist<span className="orange">.</span></h2>
    </div>
    <span className="count">
      {savedPeople.length.toString().padStart(2,'0')} SAVED
    </span>
  </div>

  {savedPeople.length===0 ? (
    <div className="empty-state panel">
      <Heart size={34}/>
      <h3>Your orbit is empty. For now.</h3>
      <p>Save interesting people from Discover and they'll appear here.</p>
      <button className="primary-button" onClick={()=>setTab('discover')}>
        EXPLORE PEOPLE <ArrowUpRight size={15}/>
      </button>
    </div>
  ) : (
    <div className="people-grid">
      {people.filter(p=>savedPeople.includes(p.id)).map((p,i)=>(
        <motion.article
          key={p.id}
          className={`person-card card-tone-${i%4}`}
          onClick={()=>setSelectedPerson(p)}
          style={{cursor:'pointer'}}
          whileHover={{y:-5,rotate:i%2?-.5:.5}}
          transition={{type:'spring',stiffness:280}}
        >
          <div className="person-top">
            <span className="person-index">SIGNAL_0{p.id}</span>
            <button
              className="icon-button saved"
              aria-label={`Unsave ${p.name}`}
              onClick={(e)=>{
                e.stopPropagation();
                setSavedPeople(current=>current.filter(id=>id!==p.id));
                notify(`Removed ${p.name} from shortlist`);
              }}
            >
              <Heart size={16} fill="currentColor"/>
            </button>
          </div>

          <div className="avatar-big">{p.initials}</div>

          <div className="person-meta">
            <span className="vibe">{p.vibe}</span>
            <h3>{p.name}<span className="verified">✳</span></h3>
            <p>{p.tagline}</p>
          </div>

          <div className="tag-row">
            {p.interests.slice(0,3).map(t=><span key={t}>#{t}</span>)}
          </div>

          <button
            className="connect"
            onClick={(e)=>{
              e.stopPropagation();
              setPrompt(`Help me plan a low-pressure ${p.interests[0]} hangout with people who share this interest.`);
              setTab('planner');
            }}
          >
            MAKE A PLAN <ArrowUpRight size={15}/>
          </button>
        </motion.article>
      ))}
    </div>
  )}
</>}
  {tab==='planner'&&<><div className="page-intro"><div className="kicker">02 / THE CO-PILOT</div><h1>Turn a <em>maybe</em><br/>into a plan<span className="orange">.</span></h1><p>Tell the agent what you're in the mood for. It will turn the vague into the doable.</p></div><div className="planner-layout"><div className="planner-input panel"><div className="panel-head"><span><Bot size={17}/> AFTERHOURS AGENT</span><span className="online">● READY</span></div><label htmlFor="prompt">WHAT'S THE VIBE?</label><textarea id="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="I want to do something fun this weekend..."/><div className="prompt-hints"><button onClick={()=>setPrompt(samplePrompt)}>↳ Sport + new people</button><button onClick={()=>setPrompt('Find a relaxed coffee and bookshop hangout on Saturday afternoon, 3 people, under ₹300 each.')}>↳ Slow Saturday</button><button onClick={()=>setPrompt('I want to discover live music this weekend with 4 people, budget ₹700 each.')}>↳ Find a gig</button></div><div className="input-footer"><span><MapPin size={13}/> KOZHIKODE · INDIA</span><button className="primary-button" disabled={loading||prompt.trim().length<5} onClick={generate}>{loading?'THINKING...':'GENERATE PLAN'} <Sparkles size={15}/></button></div></div><div className="agent-aside"><div className="orbit-art"><div className="orbit o1"/><div className="orbit o2"/><div className="orbit-core"><Bot size={34}/></div><span className="orbit-tag t1">INTENT</span><span className="orbit-tag t2">MATCH</span><span className="orbit-tag t3">IRL</span></div><h3>Not another chatbot.</h3><p>A planning agent that breaks a request into intent, options, logistics and a human-approved next step.</p></div></div>{error&&<div className="error-note"><X size={15}/>{error}</div>}{plan&&<motion.div className="plan-result panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}><div className="panel-head"><span><Sparkles size={16}/> YOUR PLAN, IN THE MAKING</span><span className="demo-label">{plan.source==='llm'?'MODEL-ASSISTED':'DEMO ENGINE'}</span></div><div className="plan-title-row"><div><div className="kicker">A POSSIBLE GOOD TIME</div><h2>{plan.title}</h2></div><span className="plan-stamp">PLAN<br/>NO. 001</span></div><div className="plan-facts"><div><small>THE ACTIVITY</small><b>{plan.activity}</b></div><div><small>WHEN</small><b>{plan.suggested_time}</b></div><div><small>WHERE</small><b>{plan.location}</b></div><div><small>PER PERSON</small><b>₹{plan.estimated_budget}</b></div></div><p className="plan-description">{plan.description}</p><div className="why-box"><Sparkles size={16}/><span>{plan.match_reason}</span></div><div className="checklist">{plan.checklist.map((c,i)=><div key={i}><Check size={14}/>{c}</div>)}</div><button className="primary-button wide" onClick={create} disabled={busy}>{busy?'CREATING...':'CREATE MEETUP DRAFT'} <ArrowUpRight size={16}/></button><small className="fine-print">Nothing is booked and nobody is contacted. You approve the next step.</small></motion.div>}</>}
  {tab==='meetups'&&<><div className="page-intro"><div className="kicker">03 / PLANS WITH PULSE</div><h1>From chat<br/>to <em>calendar.</em></h1><p>Your plans live here. In this demo, meetups are drafts and no invitations are sent.</p></div>{meetups.length===0?<div className="empty-state panel"><CalendarDays size={34}/><h3>Nothing on the calendar. Yet.</h3><p>Your first plan is one good idea away.</p><button className="primary-button" onClick={()=>setTab('planner')}>MAKE A PLAN <ArrowUpRight size={15}/></button></div>:<div className="meetup-layout"><div className="meetup-list">{meetups.map(m=><button key={m.id} onClick={()=>{setActiveMeetup(m.id);setRecovery(null)}} className={`meetup-row ${current?.id===m.id?'chosen':''}`}><div className="meetup-date">#{String(m.id).padStart(3,'0')}</div><div className="meetup-row-info"><b>{m.title}</b><small>{m.activity} · {m.suggested_time}</small></div><span className={`status status-${m.status}`}>{m.status.replace('_',' ')}</span><ChevronRight size={16}/></button>)}</div>{current&&<div className="meetup-detail panel"><div className="kicker">MEETUP / {String(current.id).padStart(3,'0')}</div><h2>{current.title}</h2><p>{current.description}</p><div className="detail-line"><CalendarDays size={16}/>{current.suggested_time}</div><div className="detail-line"><MapPin size={16}/>{current.location}</div><div className="detail-line"><Users size={16}/>{current.group_size} people · ₹{current.estimated_budget} per person</div><button className="secondary-button wide" onClick={()=>{setTab('recovery');setActiveMeetup(current.id);setRecovery(null)}}>OPEN ANTI-GHOSTING <Heart size={15}/></button></div>}</div>}</>}
  {tab==='recovery'&&<><div className="page-intro"><div className="kicker">04 / THE PLAN RESCUER</div><h1>Don't let the<br/><em>group chat</em><br/>win<span className="orange">.</span></h1><p>When replies go quiet, reduce the friction. No guilt trips. No spam. Just a better next step.</p></div>{meetups.length===0?<div className="empty-state panel"><Heart size={34}/><h3>First, make a plan.</h3><p>Anti-Ghosting needs a meetup draft to work with.</p><button className="primary-button" onClick={()=>setTab('planner')}>MAKE A PLAN <ArrowUpRight size={15}/></button></div>:<div className="recovery-layout"><div className="recovery-console panel"><div className="panel-head"><span><Activity size={17}/> SOCIAL MOMENTUM MONITOR</span><span className="online">● MONITORING</span></div><label>SELECT A PLAN</label><select value={current?.id||''} onChange={e=>{setActiveMeetup(Number(e.target.value));setRecovery(null)}}>{meetups.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>{current&&<><div className="momentum"><div><small>REPLY MOMENTUM</small><strong>{current.unanswered>0?'NEEDS A NUDGE':'AWAITING SIGNALS'}</strong></div><div className="momentum-bars">{[1,2,3,4,5,6,7,8].map(n=><i key={n} className={n<=(current.unanswered?3:6)?'bar-on':''}/>)}</div></div><div className="recovery-stat"><span>UNANSWERED RSVPS</span><b>{current.unanswered}</b></div><button className="secondary-button wide" disabled={busy} onClick={simulate}><RefreshCw size={15}/> SIMULATE 2 QUIET RSVPS</button><button className="primary-button wide" disabled={busy} onClick={recover}><Heart size={15}/> RUN RECOVERY AGENT</button><small className="fine-print">Simulation only. No real users receive messages.</small></>}</div><div className="recovery-output panel">{recovery?<><div className="kicker">RECOVERY RECOMMENDATION</div><div className="recovery-head"><div className="recovery-icon"><Heart/></div><span className="demo-label">AGENT OUTPUT</span></div><h2>{recovery.headline}</h2><p>{recovery.explanation}</p><div className="recovery-actions">{recovery.actions.map((a:string,i:number)=><div key={i}><span>0{i+1}</span>{a}</div>)}</div><div className="why-box"><Sparkles size={16}/><span>{recovery.revised_plan}</span></div></>:<div className="recovery-placeholder"><div className="placeholder-orbit"><Heart size={30}/></div><h3>Plans need a pulse.</h3><p>Simulate quiet RSVPs, then run the recovery agent to see how it responds.</p></div>}</div></div>}</>}
  </motion.div></AnimatePresence><footer className="footer"><span>AFTERHOURS © 2026 · AN INDEPENDENT PORTFOLIO EXPERIMENT</span><span>BUILT FOR THE OUTSIDE WORLD <span className="orange">✳</span></span></footer></div></section>
  
<AnimatePresence>
  {selectedPerson && (
    <motion.div
      className="profile-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedPerson(null)}
    >
      <motion.section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${selectedPerson.name} profile`}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="profile-modal-close"
          onClick={() => setSelectedPerson(null)}
          aria-label="Close profile"
        >
          <X size={20} />
        </button>

        <div className="profile-modal-top">
          <span className="person-index">
            SIGNAL_0{selectedPerson.id}
          </span>
          <span className="vibe">{selectedPerson.vibe}</span>
        </div>

        <div className="profile-modal-avatar">
          {selectedPerson.initials}
        </div>

        <div className="profile-modal-handle">
          {selectedPerson.handle}
        </div>

        <h2>{selectedPerson.name}</h2>
        <p>{selectedPerson.tagline}</p>

        <div className="profile-modal-tags">
          {selectedPerson.interests.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>

        <div className="profile-modal-suggestion">
          Find your frequency. Start with a shared interest and turn it
          into a real-world plan.
        </div>

        <button
          className="primary-button wide"
          onClick={() => {
            setPrompt(
              `Help me plan a low-pressure ${selectedPerson.interests[0]} hangout with people who share this interest.`
            );
            setSelectedPerson(null);
            setTab('planner');
          }}
        >
          MAKE A PLAN <ArrowUpRight size={16} />
        </button>
      </motion.section>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}><Check size={16}/>{toast}</motion.div>}</AnimatePresence>
 </main>
}
