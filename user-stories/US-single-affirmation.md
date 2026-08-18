# US-single-affirmation (PRD R1)

**Story:**
As a visitor, I want to see exactly one affirmation when I open the app, so that I don't have to choose from a list or figure out what matters today.

**Acceptance Criteria:**
- On page load, exactly one affirmation is displayed; no list, menu, or category selector is visible anywhere on the page.
- The affirmation text is fully visible without scrolling on common mobile and desktop viewport sizes.
- Reloading the page within the same day shows the same "today" affirmation, not a new random one each time.
- Negative path: if no affirmation can be determined (content failed to load, or the "today" pick errors), the page shows the fallback affirmation instead of a blank or empty state.
