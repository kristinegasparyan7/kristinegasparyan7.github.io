# US-no-notifications (PRD R4)

**Story:**
As a user, I want the app to leave me alone between visits, so that I'm never woken up by a broken or late reminder the way I was with other apps.

**Acceptance Criteria:**
- No notification-permission prompt appears anywhere in the v1 flow.
- No background or push notification is ever sent by the app.
- The app's only interaction point is the page itself, visited on the user's own initiative.
- Tradeoff instead of a negative path (this requirement is an absence-of-feature, so there's no failure mode to test): shipping with zero nudge means nothing brings a lapsed user back. That's [prd.md](../prd.md)'s Riskiest Assumption #1 — accepted knowingly for v1, not an oversight.
