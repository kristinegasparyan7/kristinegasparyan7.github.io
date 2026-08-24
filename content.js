/* ---------------------------------------------------------------
   OneGoodThought — curated content (R5, R11)

   APPEND-ONLY. Kept links (R9) encode positions in this array, so
   reordering or removing an entry silently changes what someone's
   saved link shows. New affirmations go at the end, always.

   f: feelings it suits    anxious | low | overwhelmed | tired | angry | steady
   c: situations it suits  work | people | health | money | change | self | none
   --------------------------------------------------------------- */

window.OGT_CONTENT = {

  feelings: [
    { id: 'anxious',     label: 'Anxious' },
    { id: 'low',         label: 'Low' },
    { id: 'overwhelmed', label: 'Overwhelmed' },
    { id: 'tired',       label: 'Tired' },
    { id: 'angry',       label: 'Frustrated' },
    { id: 'steady',      label: 'Steady' }
  ],

  contexts: [
    { id: 'work',   label: 'Work' },
    { id: 'people', label: 'People' },
    { id: 'health', label: 'My body' },
    { id: 'money',  label: 'Money' },
    { id: 'change', label: 'Uncertainty' },
    { id: 'self',   label: 'Myself' },
    { id: 'none',   label: 'Nothing specific' }
  ],

  // R13 — gratitude prompts. Five are drawn per day, deterministically.
  // Concrete and small on purpose: "a meal you enjoyed" is answerable on a
  // bad day; "what are you grateful for?" is not.
  prompts: [
    "Someone who made this week easier",
    "Something your body did for you today",
    "A small thing that went right",
    "Something you're glad you didn't put off",
    "A place you felt comfortable in",
    "Something someone said that stayed with you",
    "Something you own that still works",
    "Something you learned recently, however small",
    "A meal you actually enjoyed",
    "Something you handle better than you used to",
    "A sound you were glad to hear",
    "Someone who is easy to be around",
    "Something you were trusted with",
    "A moment today that wasn't difficult",
    "Something you're looking forward to"
  ],

  affirmations: [
    /* 0 */  { t: "You don’t have to have it figured out today.",              f: ['anxious','overwhelmed'],     c: ['change','work','self'] },
    /* 1 */  { t: "Rest is not something you have to earn.",                   f: ['tired','overwhelmed'],       c: ['work','self','health'] },
    /* 2 */  { t: "You are allowed to move slower than you think you should.", f: ['overwhelmed','tired'],       c: ['work','self','health'] },
    /* 3 */  { t: "One honest step counts more than ten perfect ones.",        f: ['overwhelmed','anxious'],     c: ['work','self'] },
    /* 4 */  { t: "You can be proud of yourself and still have work to do.",   f: ['low','steady'],              c: ['work','self'] },
    /* 5 */  { t: "Nothing is wrong with you for needing a break.",            f: ['tired','overwhelmed'],       c: ['work','health','self'] },
    /* 6 */  { t: "You’ve survived every hard day so far. That’s not nothing.",f: ['low','anxious'],             c: ['change','health','none'] },
    /* 7 */  { t: "It’s okay to want things to be easier.",                    f: ['tired','low','overwhelmed'], c: ['money','work','health'] },
    /* 8 */  { t: "You don’t owe anyone constant progress.",                   f: ['tired','low'],               c: ['work','self','people'] },
    /* 9 */  { t: "Today can be small and still be enough.",                   f: ['tired','low','overwhelmed'], c: ['none','self'] },
    /* 10 */ { t: "You’re allowed to change your mind.",                       f: ['anxious','steady'],          c: ['change','work','people'] },
    /* 11 */ { t: "Being tired isn’t a character flaw.",                       f: ['tired'],                     c: ['health','work','self'] },
    /* 12 */ { t: "You can start again without explaining why you stopped.",   f: ['low','steady'],              c: ['change','self','work'] },
    /* 13 */ { t: "Not every day has to feel like growth to count.",           f: ['low','tired'],               c: ['self','none'] },
    /* 14 */ { t: "You’re doing better than the voice in your head says.",     f: ['low','anxious'],             c: ['self'] },
    /* 15 */ { t: "It’s fine to need reminding of things you already know.",   f: ['low','anxious'],             c: ['self','none'] },
    /* 16 */ { t: "You can care about this and still take it slow.",           f: ['overwhelmed','anxious'],     c: ['work','people','health'] },
    /* 17 */ { t: "Some days, showing up is the whole job.",                   f: ['tired','overwhelmed'],       c: ['work','none'] },
    /* 18 */ { t: "You’re not behind. There was never a schedule.",            f: ['anxious','low'],             c: ['change','self','work'] },
    /* 19 */ { t: "You can hold two things: this is hard, and you’re okay.",   f: ['anxious','low','angry'],     c: ['none','change','health'] },
    /* 20 */ { t: "Whatever you did today was done by someone trying.",        f: ['low','tired'],               c: ['self','work'] },
    /* 21 */ { t: "You don’t need permission to rest, but here it is anyway.", f: ['tired','overwhelmed'],       c: ['work','health'] },
    /* 22 */ { t: "You’re allowed to take up space without a reason.",         f: ['low','anxious'],             c: ['people','self'] },
    /* 23 */ { t: "This moment doesn’t need to be productive to matter.",      f: ['tired','overwhelmed','steady'], c: ['work','none','self'] },

    /* --- appended for R11 coverage --- */

    /* 24 */ { t: "Your anger is information, not a failure of character.",    f: ['angry'],                     c: ['self','people','work'] },
    /* 25 */ { t: "You can be furious and still be fair to yourself.",         f: ['angry'],                     c: ['self','people'] },
    /* 26 */ { t: "Not every unfair thing needs your energy today.",           f: ['angry','tired'],             c: ['work','people'] },
    /* 27 */ { t: "You’re allowed to be upset about something that hurt.",     f: ['angry','low'],               c: ['people','self'] },
    /* 28 */ { t: "Frustration usually means you cared. That isn’t a flaw.",   f: ['angry'],                     c: ['work','people','self'] },
    /* 29 */ { t: "Being careful with money isn’t the same as failing at it.", f: ['anxious','low'],             c: ['money'] },
    /* 30 */ { t: "Your worth was never a number in an account.",              f: ['low','anxious'],             c: ['money','self'] },
    /* 31 */ { t: "Tight months are seasons, not verdicts.",                   f: ['anxious','low'],             c: ['money','change'] },
    /* 32 */ { t: "You can want more without being ungrateful.",               f: ['low','steady'],              c: ['money','work'] },
    /* 33 */ { t: "You can love someone and still need distance from them.",   f: ['overwhelmed','angry'],       c: ['people'] },
    /* 34 */ { t: "Being hard to reach today doesn’t make you a bad friend.",  f: ['tired','overwhelmed'],       c: ['people'] },
    /* 35 */ { t: "Not everyone’s reaction to you is a fact about you.",       f: ['anxious','low'],             c: ['people','self'] },
    /* 36 */ { t: "You can disappoint someone and still be a good person.",    f: ['anxious','overwhelmed'],     c: ['people','self'] },
    /* 37 */ { t: "One awkward conversation is not the whole friendship.",     f: ['anxious'],                   c: ['people'] },
    /* 38 */ { t: "Your body is asking for something, not complaining.",       f: ['tired'],                     c: ['health'] },
    /* 39 */ { t: "Healing rarely moves in a straight line. That’s normal.",   f: ['low','tired'],               c: ['health','change'] },
    /* 40 */ { t: "You can take this at the pace your body sets.",             f: ['tired','overwhelmed'],       c: ['health'] },
    /* 41 */ { t: "A hard body day is not a personal failure.",                f: ['low','angry'],               c: ['health','self'] },
    /* 42 */ { t: "Not knowing yet is a normal part of finding out.",          f: ['anxious'],                   c: ['change','work'] },
    /* 43 */ { t: "You can be scared of a change you also chose.",             f: ['anxious'],                   c: ['change'] },
    /* 44 */ { t: "Uncertainty is uncomfortable. It isn’t dangerous.",         f: ['anxious'],                   c: ['change'] },
    /* 45 */ { t: "You’ve adapted to things you once thought impossible.",     f: ['anxious','low'],             c: ['change'] },
    /* 46 */ { t: "The job is not the whole measure of you.",                  f: ['low','overwhelmed'],         c: ['work','self'] },
    /* 47 */ { t: "You can do good work without doing all of it today.",       f: ['overwhelmed','anxious'],     c: ['work'] },
    /* 48 */ { t: "Someone else’s urgency is not automatically yours.",        f: ['overwhelmed','angry'],       c: ['work','people'] },
    /* 49 */ { t: "You’re allowed to stop at good enough.",                    f: ['overwhelmed','tired'],       c: ['work','self'] },
    /* 50 */ { t: "You wouldn’t speak to anyone else the way you speak to yourself.", f: ['low','angry'],        c: ['self'] },
    /* 51 */ { t: "You can like yourself before you’ve fixed everything.",     f: ['low'],                       c: ['self'] },
    /* 52 */ { t: "The mistake was a thing you did, not a thing you are.",     f: ['low','angry'],               c: ['self','work'] },
    /* 53 */ { t: "Nothing has to be wrong for you to deserve a good day.",    f: ['steady'],                    c: ['none','self'] },
    /* 54 */ { t: "Steady is an achievement. It just doesn’t announce itself.",f: ['steady'],                    c: ['none','work'] },
    /* 55 */ { t: "You can enjoy this without waiting for it to end.",         f: ['steady'],                    c: ['none','people'] },
    /* 56 */ { t: "Ordinary days are most of a life. This one counts.",        f: ['steady'],                    c: ['none'] },
    /* 57 */ { t: "Pick the next thing, not the whole list.",                  f: ['overwhelmed'],               c: ['work','none'] },
    /* 58 */ { t: "You can put something down without dropping it forever.",   f: ['overwhelmed','tired'],       c: ['work','people'] },
    /* 59 */ { t: "Sleep is not a reward for finishing.",                      f: ['tired'],                     c: ['health','work'] },
    /* 60 */ { t: "Money is a problem to solve, not proof of your worth.",     f: ['anxious','low','angry'],     c: ['money','self'] },
    /* 61 */ { t: "You can be responsible about money without fearing it.",    f: ['anxious','steady'],          c: ['money'] },

    /* --- appended to shore up thin pairs (steady+health, overwhelmed+money, angry) --- */

    /* 62 */ { t: "Feeling well today is worth noticing, not just using.",     f: ['steady'],                    c: ['health','none'] },
    /* 63 */ { t: "A body that carried you this far deserves some kindness.",  f: ['steady','low'],              c: ['health','self'] },
    /* 64 */ { t: "The numbers will still be there after you’ve rested.",      f: ['overwhelmed','tired','anxious'], c: ['money','work'] },
    /* 65 */ { t: "You can only make the next decision, not all of them.",     f: ['overwhelmed'],               c: ['money','change','work'] },
    /* 66 */ { t: "It’s fair to be angry about something you can’t control.",  f: ['angry'],                     c: ['change','money','health'] },
    /* 67 */ { t: "Being let down doesn’t mean you were foolish to hope.",     f: ['angry','low'],               c: ['people','change'] },
    /* 68 */ { t: "You’re allowed to feel fine without justifying it.",        f: ['steady'],                    c: ['self','none'] },
    /* 69 */ { t: "A good stretch isn’t luck you’ll be punished for.",         f: ['steady','anxious'],          c: ['none','change'] }
  ]
};
