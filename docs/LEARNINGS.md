# Learnings log

Dated, specific, in the order they happened. Add an entry whenever something breaks, surprises us, or changes a decision.

## Tue 24 Nov

- **The hackathon page could not be fetched from the sandbox.** `dorahacks.io` did not resolve because it is outside the session's allowed network domains. The page text and the project list were pasted in by hand as a CSV instead. Any later check of the live list needs the host allowed, or a fresh paste.
- **54 builds were analysed from the CSV: 27 Messaging, 17 Crypto, 6 Exchanges, 4 AI Assistants.** About 24 are some form of Telegram inbox with AI drafts. We chose AI Assistants as the primary track and Telegram as a differentiator, not the whole product. These are concept-level reads of one-line pitches; no repo or video was opened.
- **An early read of the CSV was wrong.** The first 24-row sample suggested the AI Assistants track had two entries and nobody had built a meeting brief. The full list has four, and FUSE Brief covers the meeting brief. The lesson: do not size a gap from a partial list.
- **The Debrief web app carries an MIT licence file, but it names a different copyright holder, and the repository root has no licence.** Because we cannot tell what the author permits, the Greenlight web app is written fresh in a similar visual style (stack, layout ideas, tokens as inspiration) and no Debrief source files are copied. The README says what was inspired by what. Whether the author allows reuse is an open question ([QUESTIONS.md](QUESTIONS.md)).
- **The ElevenLabs CLI cannot hand a key to a cloud session.** Its onboarding needs a browser on the same machine, so it asked for a key to be pasted into `.env.local`, which cannot be edited from the chat session. The key goes in the environment's secrets and is picked up by a new session. The key is never pasted into chat.
- **A new session starts from a fresh clone.** Uncommitted files do not carry over, so the repo was pushed to GitHub before the key was added.
- **Beacon's winning doc set is the model for the docs here:** a plan, a task list with Done-when lines, a status page, a win plan tied to the rubric, a human runbook, a submission-day timeline, and a safety document where each control names its proof. We copy the structure, not the text.
