# Context :

At leboncoin, our users can share messages about a transaction, or ask for informations about any products.

Your job is to create the interface to consult those messages.
The interface needs to work on both desktop & mobile devices.

In addition to your code, a README explaining your thought process and your choices would be appreciated.

# Exercise :

- Display a list of all the conversations
- Allow the user to select a conversation
  - Inside the conversation, there is a list of all the messages between these two users.
  - As a user, you can type and send new messages in this conversation

**As your application can be used by millions of users, make sure to provide some robust safety guards.**

### Sketches :

Obvisouly, it is up to you to make something nice and pretty, you are free to design it the way you like. The sketches are here to give you an idea on how it should look.

<details>
  <summary>Click to see the sketches</summary>
  
Mobile list :

![](./sketches/list-mobile.jpg)

Desktop list :

![](./sketches/list-desktop.jpg)

Mobile conversation :

![](./sketches/conv-mobile.jpg)

Desktop conversation :

![](./sketches/conv-desktop.jpg)

</details>

### API :

You can find the API swagger file in `docs/api-swagger.yaml`.

For a better readibility, you can view it on [https://leboncoin.tech/frontend-technical-test/](https://leboncoin.tech/frontend-technical-test/).

---

## Bonus 1 :

We provide some conversation samples, but can you improve the app so the user can now create new conversations ?

## Bonus 2 :

Our infrastructure is a bit shaky.. Sometimes the servers are crashing. “It’s not you, it’s me”, but maybe you can display something nice to warn the user and handle it gracefully.

## Do you want to make the app even better ?

Feel free to make as many improvements as you like.
We love creativity and technical challenges.

If you are out of ideas, here are some thoughts :

- As we want to reach our users anywhere, we need to make sure the app is performing well. What can you do to make it really fast ?

- Our goal is to support everybody in the country, including people with disabilities. As a good citizen and a good developer, can you make sure the app is accessible for everyone ?

- We all love to relax after a hard day’s work. It would be a shame if we didn’t feel confident enough about the upcoming automatic deployment. Are you sure everything has been tested thoroughly ?

---
---

# Solution

> **Note on AI assistance:** this solution was built with the help of an AI coding assistant (Claude). I directed the architecture and the technical choices documented below, reviewed the code, and validated the behaviour manually. The write-up that follows reflects my own reasoning about the trade-offs.

## Running it

Two terminals:

```bash
npm run start-server
```

```bash
npm run dev
```

The API listens on `:3005`, the app on `:3000`. The API base URL can be overridden with `NEXT_PUBLIC_API_URL`.

> `src/server/db.json` is a live database, not a fixture — json-server writes every `POST`/`DELETE` straight back to it, so using the app dirties the file. To reset the sample data, **stop the server first**, then `git checkout -- src/server/db.json` (a running server will otherwise rewrite the file from memory).

## What was built

Core requirements, both bonuses, plus a delete feature:

- Conversation list, sorted by most recent, with the other participant's name and a relative date
- Conversation thread with message history and a composer
- Responsive: one pane at a time on mobile, master–detail split from `60rem` up
- **Bonus 1** — create a new conversation (user picker excluding yourself and existing contacts)
- **Bonus 2** — graceful degradation when the backend dies: typed errors, retries with backoff, per-pane error states with retry, an offline banner, and a render error boundary
- Delete a conversation, with confirmation and a server-side cascade to its messages
- A branded splash screen on first load

## Architecture

```
src/
  lib/api/      client.ts (fetch, timeouts, typed errors)
                guards.ts (runtime response validation)
                endpoints.ts (one function per API call)
  lib/          queryClient.ts, queryKeys.ts
  hooks/        one hook per operation, wrapping React Query
  components/   layout/ · conversation/ · thread/ · ui/
  pages/        / and /conversations/[id]
  utils/        pure helpers, no React
```

The layering is deliberate: **components never call `fetch`**, hooks never build URLs, and the API layer knows nothing about React. Each layer is replaceable without touching the others.

## Key decisions

**TanStack Query over hand-rolled state.** Caching, deduplication, retry policy, optimistic updates and cache invalidation are the bulk of the work in a messaging UI, and they are easy to get subtly wrong by hand.

**CSS Modules + design tokens, no UI kit.** The repo had just removed `styled-components`, and CSS Modules were already wired into the Jest config. A component library would have made the UI look generic and added far more weight than four screens justify. The palette (orange `#f4661b` / navy `#16264a`) is derived from the app logo and lives as custom properties in `globals.css`.

**Client-side fetching, no SSR prefetch.** `getServerSideProps` hitting an API that — per Bonus 2 — crashes would turn a graceful per-pane error state into a whole-page 500. Client fetching with skeletons is the more resilient choice here, and it sidesteps hydration mismatches on relative timestamps as a side effect.

**Routes drive selection.** `/conversations/[id]` rather than component state, so deep links, the browser back button and the mobile back affordance all work without extra code.

**Mutations are never retried automatically.** json-server has no idempotency key, so replaying a `POST` that actually succeeded would duplicate the message. Failures surface a manual retry instead — a deliberate answer to "robust safety guards".

## Safety guards

| Concern | Handling |
|---|---|
| Empty / oversized input | `validateMessageBody` — trimmed, rejected if empty, capped at 2000 chars; checked in the submit handler, not just via `disabled` |
| Double submit | Disabled while pending **and** an early return in `onSubmit` |
| XSS | React escapes by default; `react/no-danger` is an ESLint error so it stays that way |
| Slow server | 8s timeout via `AbortController` |
| Flaky server | Retry with exponential backoff on 5xx and network errors only — never on 4xx, never on mutations |
| Navigating away mid-request | React Query's signal is composed into every request, so in-flight calls abort |
| Offline | `useOnlineStatus` drives a banner and disables the composer |
| Render crash | `ErrorBoundary` with a reset that also clears the query cache |
| One pane failing | Errors are scoped per pane — a dead list doesn't kill the thread you're reading |
| Failed send | Optimistic bubble rolls back, the text stays in the composer |
| Malformed API data | Type guards drop bad rows from lists and throw a typed error for single resources |

**What could not be guarded client-side:** authentication is a hardcoded `getLoggedUserId() === 1`, so nothing stops a client requesting another user's conversations. Rate limiting, server-side sanitisation and CSP belong on a real backend. These are the guards that would matter most at scale, and the mock API cannot express them.

## Two bugs found in the provided mock server

Both are in `src/server/middleware/conversations.js`. The fixes are minimal and commented, since modifying provided scaffolding is arguably out of scope.

**1. The conversation list served stale data.** The middleware did `require('../db.json')` — a snapshot CommonJS caches once at startup. New conversations and updated `lastMessageTimestamp` values never appeared in the list, while `/conversation/:id` and `/messages/:id` bypassed the middleware and served live data, so list and detail disagreed. Bonus 1 would have looked broken. Fixed by reading `req.app.db.getState()`.

**2. `DELETE /conversation/:id` could not work as documented.** `routes.json` rewrites that path to `/conversations?id=:id` for *all* HTTP methods, so the request reaches json-server as a collection query and 404s — the record survives. Since the rewrite can't be bypassed, the middleware now handles `DELETE` itself and removes the conversation's messages along with it (no endpoint could otherwise return or clean up orphaned messages).

Both were verified with `curl` before any UI was written.

## Accessibility

`<html lang="fr">` (previously missing), landmark elements, `role="log"` with `aria-live` on the message list, `aria-current` on the active conversation, focus moved to the thread heading when switching conversations, native `<dialog>` for modals (platform focus trap and Escape handling), a skip link, visible `:focus-visible` rings, and `prefers-reduced-motion` honoured throughout.

## Performance

The production build is ~116 kB first load. What was done: dynamic import for the modal, React Query deduplication, parallel pane queries, the existing system font stack (faster than any web font), and `content-visibility` on list rows.

What was deliberately **not** done: virtualisation (three conversations — it would add a dependency, break Ctrl+F and fight the auto-scroll; the right answer at a few hundred rows is API pagination first) and blanket memoisation (only `MessageBubble` is memoised, because the list re-renders on every optimistic insert). Measure before optimising.

## Testing

Automated tests were descoped for this pass; error paths were verified manually by stopping the API mid-session. The obsolete `App.spec.tsx` — which asserted against the placeholder homepage — was removed, and `npm test` still passes.

Had tests been in scope, the order would have been: `guards.ts` (the unwrap-and-validate logic, pure and highest-risk), `useSendMessage` (optimistic insert and rollback), and `getOtherParticipant` (the classic bug in this exercise — conversation 3 has the logged-in user as *recipient*, so naively reading `recipientNickname` shows the user their own name).

## Deviations and notes

- **The desktop sketch shows a single pane**, not a split. I read it as an early wireframe and built master–detail on desktop, keeping the sketch's one-pane flow on mobile.
- Timestamps in the API are UNIX **seconds**, not milliseconds.
- `POST` ignores the URL's path parameter entirely, so writes go to the plain collections with every field in the body — posting to `/messages/:id` would silently create a message with no `conversationId`.
- Every `GET` returns an array, including single-resource routes; a miss is `200 []`, not a 404.

## With more time

Real authentication, message pagination, an integration test suite, and a websocket or polling layer so new messages arrive without a refetch.
