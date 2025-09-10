# GesundWerk – Planning

This document defines the architecture, data model, UX flows, and delivery plan before implementation. Keep all files <500 LOC; split by feature modules.

## Goals
- Local-first health/productivity assistant with durable browser storage (localStorage/IndexedDB).
- Optional account for cloud backup/sync; privacy-first defaults.
- Minimal backend for auth, per-user state sync, and AI recommendations.

## Existing Core (done/partial)
- Dashboard, Goals, Pomodoro, Reminders with SW notifications, Journal (multi-entry), Achievements, Knowledge Hub, Settings.
- Auth (signup/verify/login), per-user cloud sync (save/load state), Profile page.

---
## New Roadmap Items (detailed plan)

### 1) Weekly Review + Insights
- Frontend
  - Page `routes/WeeklyReview.tsx`: charts for last 7/30 days (habits %, streaks, Pomodoro minutes, mood if present).
  - Simple bar/line charts now; later switch to Chart.js.
  - “AI Wochenrückblick” card: calls backend to summarize trends.
- Backend
  - Reuse `/recommendations` or add `/weekly_summary` (POST) accepting aggregated stats and returning summary.
- Steps
  1. Selector to pick range (7/30 Tage).
  2. Compute aggregates from local state.
  3. Render charts.
  4. Call backend with aggregates; render summary.

### 2) Adaptive Reminders (focus-aware)
- Frontend
  - Add fields to activity: `reminderTimes?: string[]` (done), `adaptive?: boolean`.
  - In store: track actual completion latency per activity; tune `reminderMinutes` towards times with low latency.
  - During Pomodoro: suppress reminders (reschedule to +5m after session end).
- Steps
  1. Track timestamps when reminder due and when completed.
  2. Maintain rolling median latency.
  3. If adaptive on, adjust next `reminderMinutes` within safe bounds (e.g., 30–180m).

### 3) Energy/Mood tracking
- Frontend
  - Quick mood check-in widget (1–2 clicks) on Dashboard.
  - Store `moodByDate: Record<DateKey, number>` (1–5).
  - Correlate in Weekly Review (scatter or simple stats).
- Steps
  1. Add schema + UI control.
  2. Show in Weekly Review.

### 4) Focus Rituals (pre/post)
- Frontend
  - Pre-focus checklist (hydration, posture, DND toggle hint) before starting a Pomodoro.
  - Post-focus micro-stretch pack: small GIFs (local images) for 60s.
- Steps
  1. Optional modal before starting Pomodoro.
  2. After complete, show stretch card with countdown.

### 5) Calendar integration (ICS)
- Frontend only (phase 1)
  - Button to export Pomodoro blocks as `.ics` file (download).
  - Phase 2: import `.ics` busy periods to mute reminders.
- Steps
  1. Generate ICS text from sessions.
  2. Download as blob.

### 6) Journal encryption (local key)
- Frontend
  - Generate local `crypto.subtle` key; store in `indexedDB` (not localStorage).
  - Encrypt journal entries (AES-GCM) before persisting; decrypt on view.
  - Provide passphrase export/import of key.
- Backend
  - No changes; journal remains local-first by default.
- Steps
  1. IndexedDB util wrapper.
  2. Encrypt/decrypt helpers and migration.
  3. UI: enable encryption, export/import key.

### 7) Accessibility & i18n
- Frontend
  - Keyboard navigation, focus rings, aria labels.
  - i18n scaffolding with key maps; German/English toggle.
- Steps
  1. Add `aria-*` to interactive components.
  2. Extract strings to a dictionary.

### 8) Data export/import & account deletion
- Frontend
  - Export state JSON; import/merge.
  - Profile: Delete account (server), local wipe.
- Backend
  - Add `/delete_account` (auth required) to delete user and state.

### 9) Command Palette & Shortcuts
- Frontend
  - Palette: quick actions (“Start 25m”, “+1 Wasser”, “Ziel hinzufügen”).
  - Global shortcuts (user-configurable) with clear help modal.

### 10) Smart Sensing (privacy-first, opt-in, staged)
- Purpose
  - Make selected habits “self-detecting” (beta): break detection (away/return), posture estimate (sit/stand), drinking detection.
- Privacy
  - Disabled by default. Explicit user consent required per capability.
  - On-device only; no camera frames leave the device. Show indicator when active.
  - Clear opt-out and delete button.
- Frontend (phase 1: non-ML + face presence)
  - Module `sensing/smart.ts` that:
    - Requests camera permission only when toggled on.
    - Uses FaceDetector API if available (fallback: none).
    - Low-FPS scan (e.g., 2–5 FPS) to infer “away” if no face detected for N seconds; on return, if away ≥ threshold (e.g., 2 min), auto-log a Break.
    - Cooldowns to avoid spam.
  - Settings UI: toggles for `webcamEnabled`, `autoBreaks`, (future) `autoDrink`, `postureBeta`.
- Frontend (phase 2: posture + drink ML)
  - Integrate MediaPipe Pose or TensorFlow.js pose estimation (behind toggle).
  - Simple rules: torso angle and head/shoulder alignment to infer sit/stand; bottle-to-mouth gesture to infer “drink”.
  - Performance-saver: WebWorker + throttling.
- Backend
  - None required (local-only processing).
- Steps
  1. Add UI toggles + consent copy.
  2. Implement face presence → break auto-log.
  3. Add task queue for future ML models (lazy-load).

---
## Delivery Plan (milestones)
1. Weekly Review page + AI summary (frontend + light backend input).
2. Adaptive reminders (completion latency; Pomodoro-aware suppression).
3. Journal encryption (IndexedDB + AES-GCM) + data export/import.
4. Calendar ICS export (phase 1).
5. Smart Sensing phase 1 (face presence → auto breaks) with strict consent.
6. Accessibility/i18n pass.
7. Delete account endpoint + Profile actions.

## Testing
- Unit: store reducers, reminder scheduling, ICS generator, encryption helpers.
- E2E (later): basic flows for auth, reminders, weekly review charts.

## Security/Privacy
- Opt-in sensing with clear banner and indicator; never send frames to backend.
- Journal encryption key never leaves device unless user explicitly exports.
- Account deletion erases server-side state.
