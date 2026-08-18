# PRD — OneGoodThought

*"One good thought is enough."*

## 1. Product & One-Liner
OneGoodThought delivers a single, curated affirmation — once, with no list to manage and nothing to configure. No habits to add, no streak to protect, no notification to miss.

## 2. Problem (cited from [research.md](research.md))
Comparable products fail their users in two connected ways:
- **Overwhelm from choice:** "I have 12 habits in there. Overwhelming. Don't know which one matters today." / "Too many features. I just want ONE thing to do today."
- **Motivation decays fast, nothing brings users back:** "Set it up Sunday, i felt undermotivated. By Wednesday I forget it exists. No nudge." — and 68% of churned users stop opening the app within 8 days.
- **The mechanics meant to help (streaks, reminders) break and erode trust:** "I keep losing streaks, reminders fire late." / ~40% of support tickets are notification or streak-reset failures.

## 3. Target User ([persona.md](persona.md))
"Maya" (name/role are placeholders — ASSUMPTION, not in the data). Goal: one clear thing to focus on today, not a list. Frustrations: overwhelmed by choice; streaks/reminders that fail her.

## 4. Goals & Success Metrics (MVP, ~2 build sessions)
- **Primary goal:** validate that a zero-friction, single-affirmation experience is enough to bring users back — without any of the mechanics (streaks, notifications) that broke trust in comparable products.
- **Metric:** qualitative — does a returning user say "this was enough" / do they come back unprompted at all. No infrastructure in v1 to track this quantitatively (see Out of Scope).

## 5. MVP Requirements (top requirements, cited)
- **R1 — Show exactly ONE affirmation per visit**, no list or menu. Directly answers: "I just want ONE thing to do today."
- **R2 — "Another" option** to reshuffle if it doesn't land, while staying single-focus (not a browsing list).
- **R3 — No accounts, no streaks, no persisted progress state.** Removes the entire "streak reset wrong" failure class (~40% of tickets in the cited data).
- **R4 — No push notifications in v1.** Removes the "notifications not arriving / fire late" failure class. (See Riskiest Assumption #1 below — this directly trades off against the "no nudge" pain quote.)
- **R5 — Content = curated affirmation set**, leaning on existing strength ("fond of many, many positive affirmations").
- **R6 — One hardcoded fallback affirmation + basic error state.** If content fails to load or the "today" pick errors, show the fallback affirmation instead of a blank page, with no visible error. Without this, the MVP's worst-case failure loses a user on their very first visit — worse than the 8-day churn pattern it's meant to fix (see [edge-cases-and-risks.md](edge-cases-and-risks.md)).

## 6. Out of Scope (v1)
Accounts/login, streak tracking, push notifications, habit lists, affirmation categories/browsing, social sharing, analytics/tracking infrastructure.

## 7. User Flow
Visit → see one affirmation for today → optionally tap "Another" → done. No onboarding beyond the landing view.

## 8. Build Plan (~2 sessions)
- **Session 1:** static page, affirmation content set, "show one" + "another" logic.
- **Session 2:** naming/branding applied (OneGoodThought, slogan), visual polish, deploy, light QA.

## 9. Open Questions
Where the long-term affirmation content pipeline comes from (manual curation vs. generated); whether a v2 needs *any* re-engagement mechanic at all, and if so, how to add one without repeating the notification-reliability failure seen in the cited data.

---

## 3 Riskiest Assumptions
1. **That zero nudge is viable at all.** The MVP deliberately excludes notifications (R4) to avoid a known failure mode — but the single strongest pain quote in the research is literally about the *absence* of a nudge ("By Wednesday I forget it exists. No nudge."). We're removing the thing the evidence says users are missing, betting that removing overwhelm matters more than adding a nudge. This is untested.
2. **That affirmation content quality is the differentiator.** R5 rests on personal fondness for affirmations, not on anything in research.md — no cited quote says users want *better* affirmations. This is a skill-fit assumption, not a validated pain point.
3. **That the researched persona actually wants this product.** research.md's pain points (12 habits, streaks, multi-feature overwhelm) describe a habit-tracker's users, not necessarily people looking for a pure affirmation site. Maya may be the wrong persona for what OneGoodThought is becoming — there's a real chance the validated pain and the product being built have diverged.
