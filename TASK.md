# TASKS (v2)

## Active (now)
- Accessibility: Fokusfalle/ESC/Tab im ReminderDialog; ARIA in Palette
- Command Palette: Keyboard-Navigation, zusätzliche Aktionen (Tabs, Fokus 25/45/90)
- Persist scheduler prefs to backend `/state` per user (merge on hydrate)

## Next
- Weekly Review page with charts + AI coach summary
- Migrate local storage to IndexedDB (Dexie); keep journals encrypted (phase 2)
- Backup/restore JSON; import/export UI
- Calendar export (`.ics`) for Pomodoro; import focus blocks for reminders
- Consolidate reminder scheduler; background notifications via SW; snooze presets (5/10/20m)
- Tests: reminders math, streak rollover, Pomodoro state; E2E signup→verify→login→sync
- Accessibility pass; i18n scaffolding; command palette (⌘K)

## Done
- Auth backend (signup→verify→login), JWT, user state endpoints
- Auth frontend (Login/Signup/Verify)
- PWA + SW fetch fix; global tick; reminder dialog close behavior
- Focus Mode: Start/Beenden, Busy Windows, Breathing Overlay
- Reminder smart scheduling: throttle, collisions, quiet hours, priority
