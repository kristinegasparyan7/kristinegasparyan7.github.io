# US-checkin-feeling (PRD R10)

**Story:**
As a visitor, I want to say how I feel and what's weighing on me, so that the thought I get speaks to my actual situation instead of being generic.

**Acceptance Criteria:**
- The check-in asks two questions in sequence: how the user feels, then what is affecting them.
- Each question presents a small, fixed set of options (no free text, no more than 7 choices) so the answer takes one tap, not composition.
- The user can go back from the second question to change the first answer before finishing.
- Every option set includes a neutral escape ("Steady" for feeling, "Nothing specific" for situation) so a user who isn't struggling is never forced to claim distress.
- Once checked in for the day, returning to the site goes straight to the thought — the check-in is not repeated on every reload.
- The user can re-check-in deliberately if their day changed.
- Negative path: if JavaScript never runs, the page still shows the hardcoded fallback affirmation rather than an unusable empty check-in (R6 holds).
