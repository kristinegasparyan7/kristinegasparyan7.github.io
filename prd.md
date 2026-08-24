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
- **R1 — Show exactly ONE affirmation per visit**, no list or menu. Directly answers: "I just want ONE thing to do today." *Amended for R10:* a two-question check-in now precedes the thought. The "one at a time, never a list" rule still holds for affirmations themselves, but the zero-onboarding promise no longer does — see the pivot note below.
- **R2 — "Another" option** to reshuffle if it doesn't land, while staying single-focus (not a browsing list).
- **R3 — No accounts, no streaks, no *progress* state.** Removes the entire "streak reset wrong" failure class (~40% of tickets in the cited data). Amended for R7–R9: kept thoughts are user-chosen content, not progress or achievement, and are stored in the URL rather than an account — so no streak can break and nothing can be "lost" that the user did not choose to keep.
- **R4 — No push notifications in v1.** Removes the "notifications not arriving / fire late" failure class. (See Riskiest Assumption #1 below — this directly trades off against the "no nudge" pain quote.)
- **R5 — Content = curated affirmation set**, leaning on existing strength ("fond of many, many positive affirmations").
- **R6 — One hardcoded fallback affirmation + basic error state.** If content fails to load or the "today" pick errors, show the fallback affirmation instead of a blank page, with no visible error. Without this, the MVP's worst-case failure loses a user on their very first visit — worse than the 8-day churn pattern it's meant to fix (see [edge-cases-and-risks.md](edge-cases-and-risks.md)).
- **R7 — Keep a thought.** One action on the current affirmation marks it as kept ([US-keep-thought](user-stories/US-keep-thought.md)). Answers the gap R2 leaves open: "Another" lets a user move past a thought, but nothing let them hold on to one that landed.
- **R8 — Review kept thoughts one at a time.** Kept thoughts are revisited in the same single-focus stage, never as a browsable list ([US-review-kept](user-stories/US-review-kept.md)). This is the constraint that keeps R7 from reintroducing the "12 habits, don't know which one matters" overwhelm the product exists to remove.
- **R9 — Kept thoughts live in the URL.** The link is the store: no account, no server, portable across devices by sharing or bookmarking it ([US-portable-kept](user-stories/US-portable-kept.md)). Trade-off accepted: a user who never saves the link loses the set when the tab closes, so the UI must say plainly that the link is the collection.
- **R10 — Two-question check-in.** Before the thought, the user says how they feel and what is affecting them, one tap each ([US-checkin-feeling](user-stories/US-checkin-feeling.md)). Required once per day, not per reload.
- **R11 — Match the thought to the check-in.** Affirmations carry feeling/situation tags and are scored against the answers, so the thought fits the user's actual state ([US-matched-affirmation](user-stories/US-matched-affirmation.md)). Content set expanded from 24 to 62 to cover the space without filler.
- **R12 — Check-in history.** Past check-ins are recorded on-device and reviewable, so patterns become visible ([US-checkin-history](user-stories/US-checkin-history.md)). Stored in localStorage, not the URL: a log grows without bound and cannot live in a link.

## 6. Out of Scope (v1)
Accounts/login, streak tracking, push notifications, habit lists, affirmation categories/browsing, social sharing, analytics/tracking infrastructure.

*Amended (R7–R9):* keeping thoughts is now in scope, but browsing them as a list is not — kept thoughts are reviewed one at a time (R8). Cross-device sync is handled by sharing the URL, not by accounts.

*Amended (R10–R12):* affirmation *categories* are now effectively in scope — feeling/situation tags are categories by another name — and per-visit onboarding is too. Analytics remain out of scope. Accounts remain out of scope: history is device-local.

### Pivot note (R10–R12)

This is a change of thesis, not a feature addition, and it should be read as one.

The product was chosen (see [decision.md](decision.md)) because a single affirmation with *no* setup answered the loudest validated quote: *"Too many features. I just want ONE thing to do today."* R10 puts a two-step task in front of that thought, which is the pattern the research criticised. R12 reintroduces persisted state — the class of thing R3 removed to avoid the ~40% of tickets caused by streak/state failures. History cannot "break a streak," but it is still state that can be lost when a user clears their browser.

The bet being made: a thought matched to how someone actually feels lands hard enough to justify the friction of asking. That is a direct test of Riskiest Assumption #2 (that content relevance is the differentiator) and a direct contradiction of the anti-friction reasoning behind R1. Both cannot be right. If returning users drop off at the check-in screen rather than completing it, the original thesis was correct and R10 should become optional.

## 7. User Flow
First visit of the day: check in (how you feel → what's affecting you) → see one matched affirmation → optionally "Another" → optionally "Keep" → done. Later visits the same day skip the check-in and go straight to the thought. Kept thoughts and check-in history are reviewed only on request, and each entry point stays hidden until there is something to show.

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
