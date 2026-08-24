# US-matched-affirmation (PRD R11)

**Story:**
As a visitor who has said how I feel, I want the affirmation I see to fit that feeling, so that it lands instead of feeling randomly assigned.

**Acceptance Criteria:**
- The affirmation shown after check-in is drawn from those tagged as fitting the chosen feeling, preferring ones that also fit the chosen situation.
- Exactly one affirmation is shown at a time; the match never produces a list of results (R1 holds).
- Reloading the page on the same day with the same answers shows the same affirmation, not a new one.
- "Another" continues to draw from the matched set, so the match survives past the first tap.
- Kept thoughts and kept-links continue to work unchanged alongside matching.
- Negative path: if no affirmation matches the chosen combination, the user still receives a well-fitting general affirmation — never an empty state, an error, or a "no results" message.
