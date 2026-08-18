# Edge Cases, Failure Points & Technical Constraints — OneGoodThought

Reviewed against [prd.md](prd.md) MVP flow: Visit → see one affirmation for today → optionally tap "Another" → done.

## 5 Edge Cases
1. **Same-day repeat visits** — if a user opens the app twice in one day, do they see the same affirmation both times, or a new one? Undefined behavior breaks the "today only needs one" promise either way it's answered.
2. **Timezone/midnight boundary** — "today's" affirmation needs a definition of "today." Server UTC vs. user local time will disagree near midnight, so two users (or one user across a trip) may see mismatched days.
3. **Content exhaustion via "Another"** — if a user taps "Another" enough times to cycle through the whole set, what happens next? Repeat from the start, or stop? No rule defined yet.
4. **No/slow network on load** — with no loading or error state defined, a failed content fetch shows a blank page instead of an affirmation.
5. **Accessibility** — screen reader / low-vision users need the affirmation text properly announced and legible; nothing in scope yet addresses this.

## 5 More Edge Cases
6. **Cross-device inconsistency** — no accounts means a user on phone in the morning and desktop later the same day has no shared state; they may see two different "today's" affirmations on the same day, undermining the single-source-of-truth feel.
7. **JavaScript disabled or blocked** — if the affirmation logic runs client-side, a user with JS off/blocked sees the page shell with no affirmation and no explanation.
8. **Multiple tabs open at once** — tapping "Another" in one tab may desync from local state in a second open tab, so the two tabs disagree on what "today's" pick is.
9. **Shared or bookmarked direct link opened days later** — if a specific affirmation is linkable, opening that link later shows stale content mislabeled as "today," confusing whoever receives the share.
10. **Zero-content state** — a corrupted or empty affirmation file at deploy time means there is nothing to ever show; the entire product fails silently with no content to fall back on.

## Negative Flow — Core Step ("See one affirmation for today")
1. User visits the page.
2. App computes which affirmation is "today's" (date-seeded pick from the content set).
3. Branch — failure points:
   - **Content fails to load** (network error, empty/corrupted file) → no affirmation data available.
   - **Date logic errors** (index out of range, clock skew, timezone mismatch) → wrong or missing affirmation selected.
   - **JS blocked/disabled** → selection logic never runs at all.
4. In every branch above, there is currently no error message, no retry action, and no fallback affirmation defined.
5. Result: user sees a blank or broken-looking page with no explanation and no way to recover except reloading (which can hit the same failure again) or leaving.
6. Net effect: this reproduces the original churn pattern from the research — except instead of losing the user by day 8, it loses them on their very first visit.

## What Happens When This FAILS at Each Step
- **Visit (page load):** content fails to load → blank/broken page, no affirmation shown → user leaves. This recreates the exact churn behavior the research documented, just faster (day 0, not day 8).
- **See one affirmation for today:** if the "today" logic is wrong (same as yesterday, or changes mid-day), the app feels broken/stale — undermines the one thing it promises to get right.
- **Tap "Another":** if it shows a duplicate, doesn't respond, or reshuffles endlessly with no stopping point, the user hits a smaller version of the original "too many features" fatigue — just from reshuffling instead of choosing.
- **Done (user leaves):** nothing in v1 brings them back — no notification, no nudge. This is the same failure the strongest research quote describes ("By Wednesday I forget it exists. No nudge."), reproduced by design (R4). It's a silent failure: no error, just quiet abandonment.

## Technical Constraints an Engineer Would Raise
- **Where does content live?** Static array/JSON bundled with the page vs. a backend/DB — for a 2-session build, static is the only realistic option.
- **"Today" needs a deterministic definition** — same affirmation for all users on a given date requires a date-seeded index, not random-on-load (or every refresh shows something different).
- **No accounts = no server-side state.** "Today" and "seen before" tracking must live client-side (e.g., localStorage), which breaks in private/incognito windows or when cache is cleared — acceptable for MVP, but worth stating explicitly rather than discovering it later.
- **No-repeat logic for "Another"** needs explicit handling even with a small content set, or duplicates show up immediately.
- **Hosting/deploy** — needs a simple static host (e.g., Vercel/Netlify/GitHub Pages) achievable inside a build session; no backend needed if content stays static.
- **Content ops** — since content is static, adding/editing affirmations requires a redeploy each time; worth knowing if the plan is to keep curating content post-launch.
- **No analytics in scope** means zero visibility into whether the MVP goal (do people come back) is actually measured — worth flagging now, since the stated success metric is currently unmeasurable as scoped.
- **Timezone handling** — decide once whether "today" is UTC-based (simple, but can feel "wrong" locally) or local-time-based (better UX, more logic).
