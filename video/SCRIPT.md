# Greenlight demo script (2:12, hard limit 3:00)

Voice: ElevenLabs, warm, mix of Indian and American English. Music: one quiet bed, about 25 dB under the voice, no drums. Burned-in captions.
Structure follows a winning-demo pattern: open on the problem, name the product, show how it works, show the real thing, state the safety promises, state what was built, end on the link.

| # | Scene | On screen | Real or drawn |
|---|---|---|---|
| 1 | Cold open (dark) | 9:04 PM. "3 decisions waiting": refund, vendor invoice, calendar clash. "Your team is stuck until you find a laptop." | drawn |
| 2 | Title | Logo, "An approval terminal for Even G2" | drawn |
| 3 | How it works | Diagram: three channels, API, Policy Guard (parser, model, fallback), G2, your gesture | drawn |
| 4 | Setup | Dashboard: Telegram connected, two rules typed, six-digit pairing code | **real recording** |
| 5 | Telegram | Chat, G2 card WITHIN POLICY, tap, 3 s undo, reply under the message | drawn, sample data |
| 6 | Gmail | Invoice, G2 card FLAGGED, hold to decline, reply on the thread | drawn, sample data |
| 7 | Calendar | Clash with the investor call, FLAGGED, decline | drawn, sample data |
| 8 | Audit log | Dashboard audit page with two decisions made through the real glasses API; replies received by a local Telegram stand-in | **real recording** |
| 9 | Safety | Three promises: countdown, no double send, no funds | drawn |
| 10 | Built | 84 commits, 188 tests, 3 channels, 1 glasses app, repo link | drawn (numbers from the repo) |
| 11 | End card | "Read the request. Trust your rules. Decide in one tap." | drawn |

The narration text is in [narration.json](narration.json) and is the source of truth for the words.

## Honesty rules
- Scenes 5 to 7 are labelled "Illustration · sample data" on screen. They show the intended glasses cards and the Gmail and Calendar write-backs. No Google account or model key was connected when the film was made.
- Scene 8 is labelled with the fact that no model key was set, so the fallback judged both cards.
- Re-record scenes 5 to 7 as live footage after D0-4 to D0-6 and the model key are in place.
