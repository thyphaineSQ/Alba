# Alba by Swissquote

A clickable product demo of Alba, an investing app for people who want to put their money behind what they believe in, with a community to lean on and plain-word lessons. It is built from the Claude Design handoff in `project/` and `chats/` (see `HANDOFF.md`).

## Run it

```bash
npm install
cp .env.example .env      # add ANTHROPIC_API_KEY to enable Ask Alba
npm run dev               # http://localhost:5173, including the Ask Alba endpoint
```

Production:

```bash
npm run build
npm start                 # serves dist/ and /api/chat on http://localhost:8787
```

`npm run build` alone gives a static site in `dist/` that you can host anywhere, including GitHub Pages. The whole app works there except live answers in Ask Alba, which need the small Node server so the API key never reaches the browser. Without a server, the chat says so politely.

## What's in the demo

**Onboarding (stateful):** splash → what Alba is for → where are you now → pace → themes → rhythm and amount → first payment → "Two years later" time jump.

- The pace (Calm, Steady, Bold) comes from the 10% drop answer and the horizon slider, and sets the world/themes split.
- Themes: pick up to 4, and the split updates live. Zero is a valid answer.
- Rhythm and amount: monthly or one-off, CHF 100/200/500 or a custom amount (minimum CHF 50).
- The first payment screen shows the real split and fee for the chosen amount.
- Every figure in the app after the time jump scales from the onboarding amount: balance, holdings, gains and projection.

**App tabs:**
- **Home:** balance, projection chart (it redraws when you change or pause the monthly amount under *Manage*), event RSVP.
- **Wealth:** holdings by type, allocation bar, and investing your cash into the World fund.
- **Discover:** search, sliding filter chips, theme and ETF categories, and a detail sheet with *Add to my monthly mix*.
- **Circle:** RSVP to events, follow people, heart posts, post a question anonymously, read threads.
- **Learn:** chapter accordion, the "What is an ETF?" video (a YouTube embed, so it needs a network connection), marking lessons as watched to move your progress along, and quick questions that open Ask Alba.
- **Ask Alba:** a floating assistant on every tab. It suggests questions for the page you're on and streams live answers from Claude using that page's live figures. The conversation resets when you change tab.

State is kept in `localStorage`. *Restart* under the phone resets everything. On screens narrower than 500px the app goes full screen, without the phone frame.

## Ask Alba configuration

| Variable | Default | |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Required for live answers. Server-side only. |
| `ALBA_MODEL` | `claude-opus-5` | Any Claude model ID. |
| `PORT` | `8787` | Production server port. |

The proxy (`server/chat.mjs`) keeps the system prompt on the server and limits each client to 15 questions a minute. It trims the history and message length, and streams text back as server-sent events. It uses low effort for short, fast answers and server-side refusal fallbacks (`fallbacks: "default"`).

## Code map

```
src/
  data.ts            content, copy and formatting (CHF with Swiss apostrophes)
  store.tsx          app state, derived portfolio figures, persistence
  ui.tsx             shared pieces: logo, checks, switches, sheets, count-up, motion presets
  chat.tsx           Ask Alba: page context, streaming client, floating button and sheet
  App.tsx            phone frame, screen transitions, tab bar, time-jump modal, toasts
  screens/           Onboarding, Home, Wealth, Discover, Circle, Learn
server/
  chat.mjs           Claude API proxy (also mounted on the Vite dev/preview server)
  index.mjs          production static + API server
```

## Design rules carried over

- Swissquote CT is the only typeface (400, 500 and 700).
- Black on white with one accent, #FA5B35 (tint #FEDCD3). Positive performance is green, #1E8A5E. Losses stay neutral grey, never red.
- No em dashes in any copy. Say "members", not "women".
- Motion respects the system's reduced-motion setting.
