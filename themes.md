# Research Themes — Daily Affirmations

Source: [research.md](research.md). Clustered from 6 raw data points (2 verbatim user quotes, 1 review excerpt at 3★, 1 review excerpt at 2★, 1 support-ticket stat, 1 survey stat).

---

## Theme 1: Motivation Fades Fast After Setup
**Sentiment:** Discouraged / low-energy
**Top pain:** Initial motivation doesn't survive the first few days — nothing brings the user back once the novelty wears off.
**Supporting quotes:**
> "Set it up Sunday, i felt undermotivated. By Wednesday I forget it exists. No nudge."
> "68% of churned users stopped opening it within 8 days." (survey)

ASSUMPTION: These two data points are treated as the same phenomenon (early motivation decay), but nothing in research.md confirms the 68% churned specifically because of "no nudge" — the survey doesn't state a reason, only a timing pattern.

---

## Theme 2: Cognitive Overload From Too Many Habits/Features
**Sentiment:** Overwhelmed / frustrated
**Top pain:** Users can't tell what matters today because the app surfaces too much at once.
**Supporting quotes:**
> "I have 12 habits in there. Overwhelming. Don't know which one matters today."
> Review 2★: "Too many features. I just want ONE thing to do today."

No assumption needed — both quotes directly support this theme.

---

## Theme 3: Broken Trust in Streaks
**Sentiment:** Frustrated / betrayed (loss aversion — streaks represent invested effort)
**Top pain:** Streaks reset or vanish incorrectly, erasing a core motivator.
**Supporting quotes:**
> Review 3★: "I keep losing streaks, reminders fire late."
> Tickets: "~40% are 'notifications not arriving' or 'streak reset wrong.'"

ASSUMPTION: Ticket volume (~40%) is presented as if it's split between two distinct bug types (notifications vs. streak resets), but research.md doesn't give the individual breakdown — it's possible one bug dominates the 40%, not an even mix.

---

## Theme 4: Notification Reliability Is Broken
**Sentiment:** Frustrated
**Top pain:** Reminders don't arrive or arrive late, so the app fails at its one job of prompting the habit.
**Supporting quotes:**
> Review 3★: "...reminders fire late."
> Tickets: "~40% are 'notifications not arriving'..."
> (Related, weaker signal) "No nudge." — from the Sunday/Wednesday quote, implying no reminder ever surfaced.

ASSUMPTION: Linking "No nudge" (Theme 1's quote) to a notification *bug* rather than a missing *feature* — research.md doesn't clarify whether this user expected a reminder that never came due to a bug, or whether no reminder feature existed for them at all.

---

## Cross-cutting note
Theme 3 and Theme 4 share the same ticket stat (~40% notifications/streaks) because that single data point spans two distinct pain types (data-integrity vs. delivery-reliability). Treat it as one root signal, not two independent ones, unless further ticket detail becomes available.
