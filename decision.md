# Decision — Which Idea to Build

Constraints: ~2 build sessions, limited tokens. Options: A) Habit tracker, B) Affirmation suggesting site. Skill: fond of many, many positive affirmations.

## Scoring (1–5, 5 = best)

| Criterion | A: Habit Tracker | B: Affirmation Suggesting Site |
|---|---|---|
| User-pain (validated by research.md) | 5 — direct quotes: overwhelm, broken streaks, notification failures, 68% churn by day 8 | 2 — no quote actually says "I need better affirmation suggestions"; assumed, not evidenced |
| Scope (fits ~2 sessions) | 2 — streaks + notifications + multi-habit state is real engineering | 5 — show one curated affirmation, maybe a "next" button; no accounts, no persistence required |
| Access (buildable with what you have, no blockers) | 3 — needs a notification/reminder system, the exact thing the research says is broken elsewhere | 5 — your content ("many many positive affirmations") *is* the product; no external dependency |
| Energy (matches actual skill/interest) | 2 — stated skill is affirmations content, not streak/notification engineering | 5 — directly plays to what you said you're fond of |
| **Total** | **12/20** | **17/20** |

## Recommendation: B — Affirmation Suggesting Site

**Smallest shippable version:** a single-page "One Affirmation for Today." No login, no streaks, no notifications. User opens it, gets one affirmation, can tap "another" if it doesn't land. Directly answers the one pain line from research.md that generalizes: *"I just want ONE thing to do today."*

## Steelman for A (argued once)

The habit tracker has quantified, evidenced pain (68% churn, ~40% of tickets, real quotes) — B's pain is assumed. A ruthlessly cut MVP of A (one habit, no streak, no push notifications, just a daily check-in) could match B on scope/access while inheriting real evidence instead of a guess.

## Final call

**B.** With only 2 sessions, an energy/skill mismatch is the higher-risk failure mode. Also, the "safe cut" of A (one habit, no streak, no notifications) converges toward the same shape as B — a single daily nudge, no overwhelm — so the steelman isn't actually a different product, it's a slower path to B. Ship B now; layer habit/streak mechanics on later only if validated.

**Status: Building B.**
