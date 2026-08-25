# US-never-repeat (PRD R14)

**Story:**
As a returning visitor, I want every affirmation I'm shown to be one I haven't seen before, so that the site feels like it still has something to say rather than recycling the same handful of lines.

**Acceptance Criteria:**
- An affirmation that has already been shown to this device is never shown again while any unshown affirmation remains.
- This holds across visits, across days, and across the "Another" button — not only within one session.
- If every affirmation matching the current feeling and situation has been shown, an unshown affirmation is used even though it fits less well. Never repeating outranks matching quality.
- Reloading the page shows the affirmation the user was last looking at, and does not consume a new one.
- Viewing kept thoughts does not count as seeing an affirmation — the user saved those deliberately and re-reading them is the point.
- Once the entire set has been shown, the record is cleared and the full set becomes available again, silently.
- Negative path: the record lives on the device only. Clearing browser storage restarts the cycle, and the site must keep working normally rather than erroring when the record is missing or malformed.

**Known consequence:**
The set is finite. At roughly three or four affirmations per visit, a daily visitor exhausts all 70 in about three weeks, at which point repeats resume from the beginning. Growing the content set is the only thing that extends that runway.
