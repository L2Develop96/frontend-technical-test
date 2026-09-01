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

## About this branch

This is a second solution to the same exercise, built on a separate branch (`approach/minimal-scope`) as a deliberate contrast to a more heavily engineered first pass. Same product, same features, a much lighter architecture underneath.

| | This branch | The other solution |
|---|---|---|
| Server state | TanStack Query | TanStack Query |
| Transport | axios, called directly | Custom `fetch` wrapper |
| API layer | `api/services.ts` + `api/queries.ts` | A client + runtime guards + endpoints, across several files |
| Runtime validation | None — the API's response is trusted | Every response checked against a type guard |
| Error handling | axios defaults, `isLoading` / `isError` from React Query | Typed errors, retry with backoff, timeouts, request cancellation |
| Mutations | Call the API, then `invalidateQueries` | Optimistic insert with rollback on failure |
| Resilience UI | Plain loading/error text | Per-pane error states, an error boundary, an offline banner |
| Styling | CSS Modules, a handful of tokens | A full design-token system, skeleton loaders, a splash screen |
| Source files | ~21 | ~45 |

## Running it

Two terminals:

```bash
npm run start-server
```

```bash
npm run dev
```

The API listens on `:3005`, the app on `:3000`.

> `src/server/db.json` is a live database — json-server writes every `POST`/`DELETE` back to it. To reset the sample data, stop the server first, then `git checkout -- src/server/db.json` (a running server rewrites the file from memory otherwise).

## What was built

Core requirements, both bonuses, and delete:

- Conversation list, newest first, showing the other participant and a relative date
- Conversation thread with message history and a composer
- Responsive: one pane at a time on mobile, a master–detail split from `60rem` up
- Create a new conversation (a picker excluding yourself and existing contacts)
- Delete a conversation, with a confirmation prompt and a server-side cascade to its messages

## Architecture

```
src/
  api/
    axios.ts     the one shared axios instance
    services.ts  one function per endpoint, returns response.data
    queries.ts   every useQuery / useMutation
  components/    one file per screen or piece of UI, each with a .module.css
  pages/         / and /conversations/[id]
  utils/         formatDate, getOtherParticipant, getLoggedUserId
```

No `lib/` layer, no per-hook files, no runtime type guards. Components call the hooks in `api/queries.ts` directly; those hooks call the plain functions in `api/services.ts`.

## Key decisions

**axios over a hand-rolled `fetch` client.** axios sets JSON headers on object bodies, rejects non-2xx by default, and parses the body — the same ground a custom wrapper would otherwise cover by hand. For an app this size, that default behaviour is enough; a wrapper only earns its keep once you need things axios doesn't do out of the box (typed error discrimination, a shared timeout policy, response validation).

**No runtime validation.** The API is a fixed local mock with a documented shape. Guarding every response against a hand-written type predicate is worthwhile when the backend is a black box you don't control; here it would mostly be defending against a contract that cannot change.

**No optimistic updates.** Each mutation calls the API, then invalidates the relevant query. A sent message appears after the round-trip instead of instantly, but every mutation hook is about ten lines instead of fifty, with nothing to roll back if a request fails.

**Same responsive layout as the other approach.** The master–detail split is CSS, not application logic, so simplifying the data layer doesn't mean simplifying the layout too.

**`window.confirm` for delete.** A native browser dialog is a one-line way to gate a destructive action, and third-party test tools can drive it the same way `approach/full-scope`'s custom confirmation component was tested. On that branch it's a styled `<dialog>` in the app's own visual language; here it's a smaller amount of code doing the same job.

## What this approach gives up

A crashed backend produces plain text ("Une erreur est survenue.") with no retry button, and there is no distinction between a timeout, a network failure, and a genuine 4xx/5xx — axios surfaces one generic error either way. A malformed API response is not caught before it reaches a component. There's no request cancellation, so navigating away from a slow request doesn't stop it. None of this matters against a local mock API that always answers in the same shape; it would matter increasingly as the backend becomes real, remote, and less predictable.

## Two bugs found in the provided mock server

Both are in `src/server/middleware/conversations.js`, and both were required here since this branch also builds create and delete:

**1. The conversation list served stale data.** The middleware read `require('../db.json')` — a snapshot CommonJS caches once at startup — so new conversations never appeared in the list. Fixed by reading `req.app.db.getState()` instead.

**2. `DELETE /conversation/:id` could not work as documented.** `routes.json` rewrites that path to a collection query for every HTTP method, so the request 404s and the record survives. The middleware now handles `DELETE` itself and removes the conversation's messages along with it.

Both fixes are identical to the ones on `approach/full-scope` and were re-verified with `curl` on this branch before any UI was written.

## Testing

No automated tests were added; behaviour was verified manually (send, create, delete, and stopping the API mid-session). The obsolete `App.spec.tsx`, which asserted against the placeholder homepage, was removed. `npm test` still passes on the one remaining scaffold test.

## Notes

- Timestamps in the API are UNIX seconds, not milliseconds.
- Writes go to the plain collections (`/messages`, `/conversations`); the `:id` in a write URL is only meaningful for the GET rewrites and is ignored on POST.
- Every GET returns an array, including the single-conversation route — this branch relies on filtering the already-fetched conversation list rather than a dedicated single-resource fetch.

## When each approach is the right call

The heavier branch is the better default for anything that will run against a real backend, at real scale, for real users — which is what the exercise's own brief asks for ("this application can be used by millions of users"). This branch is what the same product looks like when the backend is trusted, the team is small, and shipping speed matters more than defending against failure modes that a fixed local mock cannot produce.
