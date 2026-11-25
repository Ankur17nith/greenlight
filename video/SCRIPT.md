# Greenlight demo script (target 2:50, hard limit 3:00)

Voice: ElevenLabs, a mix of Indian and American English, warm, ~150 wpm.
On screen text: burned-in captions. Music: low, under the voice.
All demo data is seeded sandbox data.

| # | Time | On screen | Voice-over |
|---|---|---|---|
| 1 | 0:00–0:15 | Phone buzzing on a dinner table, then three notification chips: refund, vendor invoice, calendar clash | "Every founder knows this moment. It's nine p.m., you're out for dinner, and your phone buzzes. A refund to approve. A vendor waiting. A calendar clash. Small decisions, but your whole team is stuck until you open the laptop." |
| 2 | 0:15–0:30 | G2 simulator shows the Greenlight card; logo | "This is Greenlight, an approval terminal for Even G2. Requests from Telegram, Gmail and Google Calendar arrive on your glasses as one card, already checked against your own company rules." |
| 3 | 0:30–0:55 | Dashboard: connect Telegram, Gmail, Calendar; type two rules; 6-digit code appears; code typed in the Even app | "Set it up once. Connect your accounts, and write your rules in plain English. Flag expenses above five hundred dollars. Never double-book investor calls. Then pair your glasses with a six-digit code." |
| 4 | 0:55–1:35 | Telegram group: Rohan posts the $320 AWS refund. Split screen: G2 card with WITHIN POLICY. Tap. Footer shows the 3 second undo. Telegram shows "Approved by Founder via Greenlight" | "Rohan, from a client team, asks for a three-twenty-dollar AWS refund in Telegram. Greenlight reads it, checks your rules, and shows one card: what, who, and a one-line recommendation. One tap to approve. You get three seconds to undo. Then it's done, and Rohan sees the approval right in the chat." |
| 5 | 1:35–2:05 | Gmail: $900 vendor invoice arrives. G2 card shows FLAGGED over $500 limit. Hold to decline. Gmail thread shows the sent reply | "Not everything is a green light. A nine-hundred-dollar vendor invoice arrives by email. Greenlight flags it, because it's over your five-hundred limit. Hold to decline, and a polite reply goes back on the same thread." |
| 6 | 2:05–2:25 | Calendar: invite overlapping an investor call. G2 card FLAGGED. Swipe, decline. Calendar shows declined | "A new invite clashes with your investor call. Greenlight flags it against your no-double-booking rule. Decline it, and the calendar updates." |
| 7 | 2:25–2:45 | Dashboard audit log scrolling: requester, action, verdict, decision, timestamp; AI vs FALLBACK tag | "Every tap is logged: who asked, what for, the policy verdict, your decision, and when. Open the dashboard, and the whole trail is there." |
| 8 | 2:45–2:55 | Logo card with tracks and "Built for Even G2" | "Greenlight. Read the request. Trust your rules. Decide in one tap." |

## Rules for the edit
- Show the real write-back in every scene (Telegram reply, sent email, calendar status).
- Do not show real names, emails or tokens.
- If Calendar slips, drop scene 6 and extend scene 7; update `narration.json` to match.
- The gesture names in the script must match what the SDK exposes (Day 0 spike). If they change, update both files.
- The voice-over is about 330 words, which fits 2:50 with pauses.
