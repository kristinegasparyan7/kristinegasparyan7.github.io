# US-checkin-history (PRD R12)

**Story:**
As a returning visitor, I want to see how I've been feeling over time, so that I can notice a pattern I wouldn't have remembered on my own.

**Acceptance Criteria:**
- Past check-ins are listed with their date, the feeling chosen, and the situation chosen.
- The history entry point is hidden until at least one check-in has been recorded.
- History is stored on the device only — no account, no server, no cross-device sync.
- The user can clear their history, and clearing asks for confirmation first since it cannot be undone.
- History is capped at a recent window so it stays readable and cannot grow without bound.
- Negative path: if device storage is unavailable or blocked (private browsing, storage disabled), the site works normally for the current visit and simply does not persist history — it never errors, blocks the thought, or warns repeatedly.
