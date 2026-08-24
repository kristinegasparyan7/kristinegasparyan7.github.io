# US-keep-thought (PRD R7)

**Story:**
As a visitor, I want to keep a thought that lands, so that I can come back to it later without having to remember or re-roll for it.

**Acceptance Criteria:**
- The currently displayed affirmation can be kept with a single action, without leaving the page or opening a dialog.
- The control reflects state: it reads "Keep" when the thought is not kept and "Kept" when it is, and the same control un-keeps it.
- Keeping a thought never changes which affirmation is on screen — the single-focus view is preserved.
- Keeping a thought never changes today's pick; reloading still shows the same "today" affirmation (US-single-affirmation holds).
- The kept state is announced to assistive technology, not conveyed by color alone.
- Negative path: if the thought cannot be kept (storage/URL update fails), the control returns to its unkept state rather than falsely showing "Kept".
