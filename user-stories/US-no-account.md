# US-no-account (PRD R3)

**Story:**
As a first-time visitor, I want to use the app without creating an account, so that I can get my affirmation immediately without setup friction.

**Acceptance Criteria:**
- No login, signup, or account-creation step appears anywhere before the first affirmation is shown.
- No streak, progress count, or history is tracked or displayed anywhere in the UI.
- Closing and reopening the app never shows an error about missing account or lost progress, since none is expected to persist.
- Negative path: if local state (e.g. localStorage) is unavailable or gets cleared, the app still works and shows an affirmation — it never depends on persisted account state to function.
