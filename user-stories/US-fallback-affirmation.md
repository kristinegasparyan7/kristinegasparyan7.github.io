# US-fallback-affirmation (PRD R6)

**Story:**
As a visitor, I want to see something even if the app hits a technical problem, so that my very first experience isn't a blank, broken-looking page.

**Acceptance Criteria:**
- If the content set fails to load, a hardcoded fallback affirmation is shown instead of a blank page.
- If the "today" selection logic errors (e.g. a bad date calculation), the fallback affirmation is shown instead of nothing or a visible error message.
- No raw error text, stack trace, or broken layout is ever shown to the user.
- Negative path: this story *is* the negative path for US-single-affirmation and US-curated-content. Its own failure mode — the fallback itself failing to render — is a launch blocker, not something to ship around.
