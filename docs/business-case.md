# Business case

A working draft for the hackathon's business-and-safety criterion (10%). **Every market figure below is TBD and must be sourced before it is used.** No numbers are claimed here.

## 1. The user, specifically

**The founder or ops lead of a company of roughly 3 to 30 people who is also the approver for everything small.**

They share three traits:
- **They are the bottleneck.** Refunds, expenses, vendor sign-offs and calendar overrides all go to one person.
- **They are often away from a laptop.** Meetings, travel, dinners, school runs.
- **They have no approval software.** Large companies have workflow tools. This group uses chat and email, so decisions get lost or delayed.

Not the target (yet): enterprises with approval chains and compliance teams.

## 2. The problem in their words

"My team is waiting on me" and "I can't remember what I signed off on." The first is a speed problem. The second is a record-keeping problem. Greenlight addresses both with a one-tap decision and an audit log.

## 3. What it is worth

| Question | Answer |
|---|---|
| Time saved per request | TBD: measure in user tests, do not estimate |
| Cost of a delayed approval | TBD: ask five founders |
| Number of such users | TBD: source a count of small companies in the target markets |

## 4. Revenue model (proposed)

- **Per approver seat per month**, with a free tier for one source and a small queue.
- **Team plan** adds more sources, roles and a longer audit history.
- Costs to watch: AI calls per card, and API quota on Google and Telegram. Keep the AI call small (short prompt, short output) and fall back to the parser when it fails.

Prices are TBD. They should be tested with real users, not set during the hackathon.

## 5. Why now

- **A display you can glance at.** G2 puts a private screen in everyday eyewear, so a decision takes seconds instead of a phone unlock.
- **Models that read plain-English rules.** A founder can write "flag anything over $500" without a form builder.
- **Open APIs.** Telegram, Gmail and Calendar all allow a bot or token to read and reply, so the sender does not need to change anything.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Wrong approval by mistake | 3-second undo, clear badge, audit log |
| The AI misreads a request | Deterministic parser for numbers, fallback to `FLAGGED` |
| Sensitive messages on a display | Show only a short headline; no full text on the lens |
| Platform dependence on G2 | The decision card model could move to a phone or watch later |
| Small market at launch | Start with founders; expand to roles and teams |

## 7. What we need to learn

1. Which requests founders actually approve from their phones today.
2. Whether the rules they write match what they would decide.
3. Whether a log of decisions matters to them or only to their accountants.

These are questions for interviews after the hackathon. We make no claims about them now.
