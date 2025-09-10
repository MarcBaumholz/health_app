from fastapi import FastAPI, Depends, HTTPException, Header
from time import time
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, secrets
import os
import google.generativeai as genai
from dotenv import load_dotenv
from db import init_db, get_session, User, Habit, Journal, UserState
from sqlmodel import select
from auth import hash_password, verify_password, create_token, decode_token
from typing import Dict, Optional

load_dotenv()

app = FastAPI(title="GesundWerk Backend")
init_db()
LAST_NOTIFY: Dict[int, float] = {}

# Enable CORS for local dev and GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "https://marcbaumholz.github.io",  # GitHub Pages
        "https://*.github.io",  # Any GitHub Pages subdomain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)


class AuthIn(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    token: str

class VerifyIn(BaseModel):
    email: str
    code: str

class StateIn(BaseModel):
    data: dict

class StateOut(BaseModel):
    data: dict

class RecommendationRequest(BaseModel):
    work_pattern: str
    posture: str
    complaints: str


class RecommendationResponse(BaseModel):
    exercises: str
    posture: str
    tips: str

class WeeklySummaryIn(BaseModel):
    completion: list[int]
    focus: list[int]
    labels: list[str]

class WeeklySummaryOut(BaseModel):
    summary: str

# Smart scheduling models
class ReminderIn(BaseModel):
    activityId: str
    nextAt: str

class ActivityMetaIn(BaseModel):
    id: str
    dailyTarget: int
    progressToday: int

class BusyWindowIn(BaseModel):
    start: str
    end: str

class ScheduleIn(BaseModel):
    reminders: list[ReminderIn]
    activities: list[ActivityMetaIn]
    lastShownAt: Optional[float] = None
    busy: Optional[list[BusyWindowIn]] = None
    prefs: Optional[dict] = None

class ScheduleOut(BaseModel):
    reminders: list[ReminderIn]


@app.post("/signup")
async def signup(payload: AuthIn):
    with get_session() as s:
        if s.exec(select(User).where(User.email == payload.email)).first():
            raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
        code = secrets.token_hex(3)
        u = User(email=payload.email, password_hash=hash_password(payload.password), is_verified=False, verification_code=code)
        s.add(u)
        s.commit()
        # TODO: send email; for dev, return code
        return {"message": "verification_required", "code": code}

@app.post("/verify", response_model=TokenOut)
async def verify(payload: VerifyIn):
    with get_session() as s:
        u = s.exec(select(User).where(User.email == payload.email)).first()
        if not u or u.verification_code != payload.code:
            raise HTTPException(status_code=400, detail="Code ungültig")
        u.is_verified = True
        u.verification_code = None
        s.add(u); s.commit()
        return TokenOut(token=create_token(u.id))

@app.post("/login", response_model=TokenOut)
async def login(payload: AuthIn):
    with get_session() as s:
        u = s.exec(select(User).where(User.email == payload.email)).first()
        if not u or not verify_password(payload.password, u.password_hash):
            raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
        if not u.is_verified:
            raise HTTPException(status_code=403, detail="Bitte E-Mail verifizieren")
        return TokenOut(token=create_token(u.id))

def get_user_id(authorization: str = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    uid = decode_token(authorization.split(" ",1)[1])
    if not uid: raise HTTPException(status_code=401, detail="Invalid token")
    return uid

@app.post("/state", response_model=StateOut)
async def save_state(payload: StateIn, user_id: int = Depends(get_user_id)):
    from db import UserState
    with get_session() as s:
        existing = s.get(UserState, user_id)
        if existing:
            existing.data = json.dumps(payload.data)
            s.add(existing)
        else:
            s.add(UserState(user_id=user_id, data=json.dumps(payload.data)))
        s.commit()
        return StateOut(data=payload.data)

@app.get("/state", response_model=StateOut)
async def load_state(user_id: int = Depends(get_user_id)):
    from db import UserState
    with get_session() as s:
        existing = s.get(UserState, user_id)
        data = json.loads(existing.data) if existing and existing.data else {}
        return StateOut(data=data)

@app.get("/can_notify")
async def can_notify(user_id: int = Depends(get_user_id)):
    now = time()
    last = LAST_NOTIFY.get(user_id, 0)
    return {"ok": (now - last) >= 60.0}

@app.post("/mark_notify")
async def mark_notify(user_id: int = Depends(get_user_id)):
    LAST_NOTIFY[user_id] = time()
    return {"ok": True}

@app.post("/schedule", response_model=ScheduleOut)
async def schedule(payload: ScheduleIn, user_id: int = Depends(get_user_id)):
    # Parameters
    prefs = (payload.prefs or {}).get('scheduler', {}) if payload.prefs else {}
    max_per_minute = max(1, int(prefs.get('maxPerHour', 6)))
    collision_window_s = int(prefs.get('collisionWindowSec', 30))
    busy_windows = payload.busy or []

    # Quiet hours → treated as busy windows
    q_start = prefs.get('quietStart'); q_end = prefs.get('quietEnd')
    if q_start and q_end:
        from datetime import datetime, timedelta
        def today_iso_at(hhmm: str) -> str:
            h, m = (int(x) for x in hhmm.split(':'))
            now = datetime.utcnow()
            d = now.replace(hour=h, minute=m, second=0, microsecond=0)
            return d.isoformat() + 'Z'
        s_iso = today_iso_at(q_start)
        e_iso = today_iso_at(q_end)
        s_ts = _to_ts(s_iso); e_ts = _to_ts(e_iso)
        if e_ts > s_ts:
            busy_windows.append({ 'start': s_iso, 'end': e_iso })
        else:
            # spans midnight: today start → tomorrow end
            tomorrow_end = (datetime.utcnow().replace(hour=int(q_end.split(':')[0]), minute=int(q_end.split(':')[1]), second=0, microsecond=0) + timedelta(days=1)).isoformat() + 'Z'
            busy_windows.append({ 'start': s_iso, 'end': tomorrow_end })

    # 1) Drop reminders inside busy windows
    def is_busy(ts: float) -> bool:
        for w in busy_windows:
            try:
                if float(ts) >= _to_ts(w.start) and float(ts) <= _to_ts(w.end):
                    return True
            except:  # noqa
                pass
        return False

    def _to_ts(iso: str) -> float:
        from datetime import datetime
        return datetime.fromisoformat(iso.replace('Z','+00:00')).timestamp()

    items = [
        {"activityId": r.activityId, "nextAt": r.nextAt, "ts": _to_ts(r.nextAt)}
        for r in payload.reminders
    ]
    # filter busy
    items = [it for it in items if not is_busy(it["ts"])]

    # 2) Respect global throttle vs lastShownAt
    last = payload.lastShownAt or 0.0
    now = time()
    earliest_allowed = max(now, last + 60.0/max_per_minute)

    # 3) Sort by time and apply collision resolution with small delays
    items.sort(key=lambda x: x["ts"])
    adjusted = []
    last_assigned = earliest_allowed
    for it in items:
        t = max(it["ts"], last_assigned)
        # Push if too close to previous
        if adjusted and (t - adjusted[-1]["ts"]) < collision_window_s:
            t = adjusted[-1]["ts"] + collision_window_s
        adjusted.append({"activityId": it["activityId"], "nextAt": _from_ts(t), "ts": t})
        last_assigned = t

    # 4) Soft priority: prefer under-target activities when collisions occur
    prog = {a.id: a.progressToday for a in payload.activities}
    target = {a.id: a.dailyTarget for a in payload.activities}
    def score(aid: str) -> float:
        p = prog.get(aid, 0); tgt = max(1, target.get(aid, 1))
        return 1.0 - min(1.0, p / tgt)
    # If two within collision window, ensure higher score goes first
    for i in range(1, len(adjusted)):
        if adjusted[i]["ts"] - adjusted[i-1]["ts"] < collision_window_s:
            if score(adjusted[i]["activityId"]) > score(adjusted[i-1]["activityId"]):
                adjusted[i], adjusted[i-1] = adjusted[i-1], adjusted[i]
                # re-gap
                adjusted[i]["ts"] = adjusted[i-1]["ts"] + collision_window_s
                adjusted[i]["nextAt"] = _from_ts(adjusted[i]["ts"])

    return ScheduleOut(reminders=[ReminderIn(activityId=it["activityId"], nextAt=it["nextAt"]) for it in adjusted])


@app.post("/weekly_summary", response_model=WeeklySummaryOut)
async def weekly_summary(payload: WeeklySummaryIn):
    if not API_KEY:
        # Deterministic local summary
        avg_completion = round(sum(payload.completion)/max(1,len(payload.completion))) if payload.completion else 0
        total_focus = sum(payload.focus)
        text = (
            f"Durchschnittliche Erfüllung: {avg_completion}%\n"
            f"Fokuszeit gesamt: {total_focus} Min\n"
            "Vorschlag: Plane 3 feste Fokusblöcke und priorisiere 1–2 Gewohnheiten mit niedriger Quote."
        )
        return WeeklySummaryOut(summary=text)
    prompt = (
        "Erzeuge eine kurze Wochenzusammenfassung basierend auf Erfüllungsprozenten und Fokuszeit. "
        "Gib 3–5 Sätze mit konkreten Hinweisen und lobenden/realistischen Formulierungen.\n\n"
        f"Labels: {', '.join(payload.labels)}\n"
        f"Erfüllung %: {payload.completion}\n"
        f"Fokus Minuten: {payload.focus}\n"
    )
    model = genai.GenerativeModel("gemini-1.5-flash")
    result = await model.generate_content_async(prompt)
    text = (result.text or "").strip() or "Kurze, fokussierte Woche. Bleibe dran und steigere die Konstanz schrittweise."
    return WeeklySummaryOut(summary=text)

@app.post("/delete_account")
async def delete_account(user_id: int = Depends(get_user_id)):
    with get_session() as s:
        # Delete related state and content
        s.exec(select(UserState).where(UserState.user_id == user_id)).first()
        s.exec(select(Journal).where(Journal.user_id == user_id)).all()
        s.exec(select(Habit).where(Habit.user_id == user_id)).all()
        # Hard delete: use SQL to delete rows
        s.exec("DELETE FROM userstate WHERE user_id = :uid", params={"uid": user_id})
        s.exec("DELETE FROM journal WHERE user_id = :uid", params={"uid": user_id})
        s.exec("DELETE FROM habit WHERE user_id = :uid", params={"uid": user_id})
        s.exec("DELETE FROM user WHERE id = :uid", params={"uid": user_id})
        s.commit()
        return {"status": "ok"}

@app.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(payload: RecommendationRequest):
    if not API_KEY:
        # Return deterministic fallback for local dev without key
        return RecommendationResponse(
            exercises="Kurze Nacken- und Schulterdehnungen alle 60 Minuten.",
            posture="Richte den Monitor auf Augenhöhe aus, Füße flach, Rücken angelehnt.",
            tips="Steh häufiger auf, trinke Wasser, und mache kurze Spaziergänge.",
        )

    prompt = (
        "Erzeuge drei kurze, konkrete Empfehlungen basierend auf Arbeitsmuster, Haltung und Beschwerden. "
        "Format: EXERCISES|POSTURE|TIPS.\n\n"
        f"Arbeitsmuster: {payload.work_pattern}\n"
        f"Haltung: {payload.posture}\n"
        f"Beschwerden: {payload.complaints}\n"
    )

    model = genai.GenerativeModel("gemini-1.5-flash")
    result = await model.generate_content_async(prompt)
    text = (result.text or "").strip()
    parts = [p.strip() for p in text.split("|")]
    while len(parts) < 3:
        parts.append("")
    return RecommendationResponse(exercises=parts[0], posture=parts[1], tips=parts[2])
