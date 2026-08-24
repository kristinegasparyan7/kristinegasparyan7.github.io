# US-five-good-things (PRD R13)

**Story:**
As a visitor, I want to write down five good things using prompts, so that I notice specifics I would otherwise walk past — without having to invent what counts as gratitude from a blank page.

**Acceptance Criteria:**
- Five prompts are shown, each with its own field to answer in.
- Prompts are concrete and small enough to answer on a bad day ("a meal you actually enjoyed"), not open-ended ("what are you grateful for?").
- The prompt set rotates by day: the same day always asks the same five, consecutive days differ.
- Answers save automatically as they are typed — there is no save button to forget.
- Answers persist across reloads on the same device and reappear when the section is opened again.
- Partial answers are valid: leaving any or all fields blank is never blocked, warned about, or marked incomplete.
- A filled line is visually distinguished from an empty one, and not by colour alone.
- The entry point to this section is always available, unlike the kept-thoughts and history entries which stay hidden until they have content.
- The section animates in, revealing the five lines in sequence rather than all at once; the animation is suppressed under `prefers-reduced-motion`.
- Negative path: if device storage is blocked (private browsing), the fields still work for the current visit and the UI says the answers will not be saved, rather than failing silently or appearing to save.
