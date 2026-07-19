# Chat Client App

A single page chat interface built with **Next.js (App Router)**, **React 19**, and
**TypeScript**. The initial message history is rendered on the server (SSR) and the
interactive parts (composing, sending, auto-scrolling) run on the client (CSR).

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_API_TOKEN
pnpm dev      # start the dev server (http://localhost:3001)
pnpm build    # production build
pnpm start    # serve the production build (http://localhost:3001)
pnpm lint     # run ESLint
```

> The app runs on **port 3001** because the chat API occupies port 3000.

## Summary

- Single page, no router needed — one chat screen.
- History is fetched on the **server** and passed to the **client** `Chat`
  component that owns interactivity.
- Messages are presented with a `MessageCard` whose colour and alignment
  change based on the sender (white/left for others, pale yellow/right for you (current user)).
- Styling uses **CSS Modules** per component, with shared design tokens
  (colours, spacing, sizes) defined in `app/globals.css`.
- Data comes from the challenge API: the messages are fetched during
  **SSR**, then **SWR** short-polls every 3s to stay fresh; sending uses an
  optimistic `POST` with automatic rollback.
- Couldn't find a public design system for Doodle. Then I created Design-system 
  primitives that live in **`components/ui/`** (`Button`, `Input`, `Banner`) — reusable and domain-agnostic. 
- Feature-specific components live under their feature (`features/Chat/components/`). This keeps `lib/` and the
UI kit stable as features come and go.

## Architecture

### Rendering strategy (SSR + CSR)

| Layer | Type | Why |
| --- | --- | --- |
| `app/page.tsx` | Server Component | Thin route wrapper that renders the Chat feature. |
| `Chat` | Server Component | Owns the SSR fetch (first 20 messages) so the first paint already contains messages, then hands off to `ChatClient`. |
| `ChatClient` | Client Component | Holds the SWR-backed list, polls, sends messages, shows error banners, and auto-scrolls — all of which need the browser. |
| `MessageComposer` | Client Component | Owns the controlled input and submit handling. |
| `MessageList` | Client Component | Manages the feed's roving-tabindex focus and arrow-key keyboard navigation (see [Accessibility](#accessibility)). |
| `MessageCard`, `Input`, `Button` | Presentational | No client-only APIs; they render on the server for the initial HTML and hydrate cheaply. |


### Data flow

```
app/layout.tsx (server) → <SWRProvider> (app-wide SWR defaults)
app/page.tsx (server)
  └─ <Chat> (server)                 owns the SSR fetch
       └─ fetchMessages({ limit })   ← features/Chat/api/messages.ts (calls the API)
            └─ <ChatClient initialMessages>  (client; SWR seeded via fallbackData)
                 ├─ useMessages()    → SWR short-polls every 3s via messagesFetcher
                 ├─ useSendMessage() → optimistic createMessage() + rollback
                 ├─ <MessageList>    → <MessageCard> (colour by sender)
                 └─ <MessageComposer>→ <Input> + <Button> bottom bar
```

### Project structure

The codebase is **feature-first**: everything a feature owns (UI, data layer,
hooks, cache keys, domain types (here only message), constants) lives under `features/<Feature>/`,
while `lib/` holds feature-agnostic code. Adding a feature would be a new folder.

```
app/
  layout.tsx            Root layout; mounts <SWRProvider>
  page.tsx              Server Component entry (renders the Chat feature)
  globals.css           Design tokens + base styles
providers/
  SWRProvider.tsx       Applies app-wide SWR defaults (swrConfig)
components/
  ui/                   Reusable, domain-agnostic primitives
    Button/  Input/  Banner/
lib/                    Cross-cutting only
  config.ts             API base URL + token (client-safe, NEXT_PUBLIC_)
  utils.ts              Deterministic date formatting
  api/
    http.ts             Isomorphic typed fetch wrapper (transport only)
    auth.ts             Pluggable auth headers (swap scheme without touching http)
    errors.ts           ApiError + isApiError
  swr/
    fetcher.ts          Generic string-key fetcher (for future simple GETs)
    config.ts           Shared SWR defaults
features/
  Chat/
    Chat.tsx            Server wrapper (SSR fetch)
    ChatClient.tsx      Interactive client component
    keys.ts             SWR tuple keys + messagesFetcher (colocated)
    types.ts            Domain Message + API DTOs
    constants.ts        CURRENT_USER, message limit, poll interval
    api/
      messages.ts       fetchMessages() / createMessage()
      mappers.ts        DTO → domain Message
    hooks/
      useMessages.ts    SWR polling, seeded by SSR fallbackData
      useSendMessage.ts Optimistic create + rollback
    components/
      MessageList/      Renders the history as a list
      MessageCard/      Bubble; colour/alignment by sender
      MessageComposer/  Compose + send bar (client)  ← the "message sender"
```

## Styling: CSS Modules + tokens

- **CSS Modules** scope class names per component, so styles can't leak between
  components and there's no runtime CSS-in-JS cost.
- **Design tokens** (colours, spacing scale, radii, layout widths) live as CSS
  custom properties in `app/globals.css`. Components reference the tokens instead
  of hard-coding values, so theming (including the built-in dark mode via
  `prefers-color-scheme`) is centralised.

## Performance

- Static prerender of the page; minimal client JavaScript (only interactive
  components are client components).
- CSS Modules — no runtime styling library.

### Image delivery

The page background (`public/assets/body-bg.png`, ~514 KiB) is served in modern
formats via CSS `image-set()`, letting the browser pick the smallest one it
supports:

```css
--page-background-image: linear-gradient(transparent, transparent),
  image-set(
    url("/assets/body-bg.avif") type("image/avif"),  /* ~32 KiB */
    url("/assets/body-bg.webp") type("image/webp"),  /* ~48 KiB */
    url("/assets/body-bg.png")  type("image/png")    /* ~514 KiB fallback */
  );
```

This cuts the delivered background from **~514 KiB to ~32 KiB** (AVIF, ~94%
smaller) on modern browsers improving LCP.

## Accessibility

The message history follows the **[ARIA Feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)**
from the ARIA Authoring Practices Guide — the standard, assistive-tech–recognised
pattern for a scrollable stream of articles (chat logs, social timelines). It's
what powers the "focus each message with the keyboard" experience you see in apps
like WhatsApp.

### The chat/feed pattern

- The history is a **`role="feed"`** region with an accessible name
  (`aria-label="Message history"`) instead of a list.
- Each message is a focusable **`<article>`** (a *feed item*) with:
  - an **accessible name** via `aria-labelledby` pointing at its sender, so screen
    readers announce *"Ada, article"* instead of a nameless article;
  - **position metadata** (`aria-posinset` / `aria-setsize`) so AT can announce
    *"message 2 of 20"*.
- **Roving tabindex**: only the active card is in the tab order (`tabindex="0"`);
  the rest are `tabindex="-1"`. `Tab` enters the feed, then arrow keys navigate.
- **Keyboard model**: `ArrowUp` / `ArrowDown` move between messages, `Home` / `End`
  jump to the first / last. (The APG specifies `Page Up` / `Page Down`; we use
  arrow keys to match the familiar chat-app experience.)

### What matters for every component

- **Semantic HTML first** — real `<article>`, `<time dateTime>`, `<form>`,
  `<label>`, `<button>` before reaching for ARIA.
- **An accessible name** for every landmark, region, and interactive control.
- **Visible keyboard focus** — a shared `:focus-visible` ring
  (`utils/focusVisible.module.css`) on everything focusable.
- **Full keyboard operability** — different keyboard navigation for chat pattern.
- **Respect user preferences** — `prefers-color-scheme` drives dark-mode tokens.

### Colour contrast

Text/background tokens are tuned to meet **[WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)**
(≥ 4.5:1 for normal text) in both colour schemes:

| Token | Light | Dark | Contrast (light / dark) |
| --- | --- | --- | --- |
| `--color-text-muted` (author) | `#5f6368` | `#9aa0a6` | ~6:1 / ~5.2:1 |
| `--color-text-subtle` (timestamp) | `#686d72` | `#8f959c` | ~4.6:1 / ~4.6:1 |
| `--color-accent` (white text on accent) | `#d24436` | — | ~4.6:1 |
| `--color-accent-hover` (white text on accent) | `#b83b2e` | — | ~5.4:1 |

### Screen readers

**Announcing new messages:** alongside the feed, a visually-hidden
`role="log"` / `aria-live="polite"` region announces **incoming** messages as
they arrive, so screen-reader users hear *"New message from Ada: …"* without
having to navigate back into the feed. The initial history and your own
outgoing messages are intentionally not announced.

## Future improvements

### Hide the bearer token behind a proxy (security)

Today the client calls the chat API **directly**, so the bearer token ships to
the browser via `NEXT_PUBLIC_`. That is acceptable for this exercise (one shared,
non-sensitive token) but not for production. The fix is a **backend-for-frontend
(BFF) proxy**: a same-origin Next.js Route Handler

### Other ideas

- **Real-time updates** — swap short-polling for WebSockets/SSE.
- **History / pagination** — `GetMessagesParams` already exposes `before`/`after`
  for infinite scroll of older messages.
