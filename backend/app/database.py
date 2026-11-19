import os, sqlite3
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
DB_PATH = os.getenv("DATABASE_PATH", "afterhours.db")

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True) if Path(DB_PATH).parent != Path('.') else None
    with connect() as db:
        db.execute('''CREATE TABLE IF NOT EXISTS meetups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL, activity TEXT NOT NULL, suggested_time TEXT NOT NULL,
            location TEXT NOT NULL, estimated_budget INTEGER NOT NULL, group_size INTEGER NOT NULL,
            description TEXT NOT NULL, match_reason TEXT NOT NULL, checklist TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'planning', unanswered INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )''')

def row_to_meetup(row):
    if not row: return None
    item = dict(row)
    import json
    item['checklist'] = json.loads(item['checklist'])
    return item

def list_meetups():
    with connect() as db:
        rows = db.execute('SELECT * FROM meetups ORDER BY id DESC').fetchall()
    return [row_to_meetup(r) for r in rows]

def get_meetup(meetup_id: int):
    with connect() as db:
        row = db.execute('SELECT * FROM meetups WHERE id=?', (meetup_id,)).fetchone()
    return row_to_meetup(row)

def create_meetup(data: dict):
    import json
    with connect() as db:
        cur = db.execute('''INSERT INTO meetups
        (title, activity, suggested_time, location, estimated_budget, group_size, description, match_reason, checklist)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
            data['title'], data['activity'], data['suggested_time'], data['location'],
            data['estimated_budget'], data['group_size'], data['description'], data['match_reason'],
            json.dumps(data['checklist'])
        ))
        meetup_id = cur.lastrowid
    return get_meetup(meetup_id)

def set_unanswered(meetup_id: int, count: int):
    with connect() as db:
        db.execute("UPDATE meetups SET unanswered=?, status='needs_attention' WHERE id=?", (count, meetup_id))
    return get_meetup(meetup_id)

def mark_recovered(meetup_id: int):
    with connect() as db:
        db.execute("UPDATE meetups SET status='recovery_proposed' WHERE id=?", (meetup_id,))
    return get_meetup(meetup_id)
