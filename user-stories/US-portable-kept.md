# US-portable-kept (PRD R9)

**Story:**
As a visitor, I want my kept thoughts to live in a link I can save or send, so that I can keep them across devices without making an account.

**Acceptance Criteria:**
- Kept thoughts are encoded in the page URL, which updates immediately as thoughts are kept or removed.
- Opening a URL containing kept thoughts restores exactly that set, on any device or browser.
- A copy-link action is available while reviewing kept thoughts, with visible confirmation that the link was copied.
- The UI states plainly that the link is where the kept thoughts live, so the user knows the link must be saved to keep them.
- No account, login, or server-side storage is involved.
- Negative path: a malformed, truncated, or out-of-range link is treated as "nothing kept" — the page still loads today's thought normally and never shows an error or a blank screen.
