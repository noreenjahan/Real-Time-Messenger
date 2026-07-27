# Ping — Real-Time Messenger UI

A frontend-only chat interface simulating real-time messaging (iMessage/WhatsApp Web style), built for the Khizex Frontend Engineering Internship Week 3 Build Challenge.

## Tech Stack

- **React + TypeScript (strict, zero `any`)** via Vite
- **Tailwind CSS** for styling
- **`useReducer`** for message state, plain `useState` for typing indicators and UI-local state
- **Custom `MockWebSocket` class** simulating a real-time transport layer, entirely client-side

## Architecture

src/
types/
      message.ts — Message and MessageStatus types
reducers/
          chatReducer.ts — ChatState, ChatAction chatReducer
services/
        mockWebSocket.ts — MockWebSocket class, fake contacts/replies
components/
        Header.tsx — chat title + participant list          
        ChatWindow.tsx — scrollable feed, auto-scroll logic,timestamp grouping
        MessageBubble.tsx — single message render (memoized)
        MessageInput.tsx — expanding textarea + send logic
        App.tsx — wires reducer, socket, and layout together

Each component has a single responsibility: `ChatWindow` owns layout/scrolling, `MessageBubble` owns per-message presentation, `MessageInput` owns compose state, and `App` owns orchestration (reducer + socket + typing state).

## State Management: `useReducer`

Chosen over Zustand/Jotai because all state (`messages: Message[]`) lives in one place, is consumed by a shallow component tree, and needs no cross-cutting access from unrelated parts of the app. `useReducer` gives predictable, centralized transitions via three actions:

- `SEND_MESSAGE` / `RECEIVE_MESSAGE` — append a new message immutably
- `UPDATE_STATUS` — find one message by `id` via `.map()`, return a **new object only for the matching message**, and the same object reference for all others. This matters for `React.memo` (see Performance below) — untouched messages don't get new references, so they don't re-render.

Typing indicator state (`Set<string>` of userIds currently typing) is kept in a separate `useState` in `App`, not the reducer — it's transient UI state, not part of the message history, and doesn't belong in an append-focused reducer.

## Mock Transport: `MockWebSocket`

Implemented as an event-emitter class (`on`, `send`, `disconnect`) rather than polling, because:

- **Realistic status timing.** Read receipts (`sent → delivered → read`) need to fire at arbitrary times, not on a fixed poll interval — an event-emitter lets each transition schedule its own `setTimeout`, independent of any check-in cadence.
- **Drop-in realism.** The shape mirrors a real WebSocket's `onmessage`/`send` API, so swapping in an actual backend later would be a near drop-in replacement.

**Design:**
- On construction, starts a randomized interval (4–8s) that picks a fake contact (`alice`/`bob`), emits a `typing: true` event, waits 1.2–2s, then emits `typing: false` followed by the actual `message` event — this is what makes the typing indicator feel deliberate rather than instant.
- `send(message)` simulates your own outgoing message's delivery lifecycle: after 300–900ms (per spec), emits a `status: delivered` event; after another 1–2.5s, emits `status: read`.
- Supports multiple subscribers via an internal listener array (`on()` pushes, doesn't overwrite) — needed since `App` listens for messages, status updates, and typing all through one socket.
- `disconnect()` clears the interval and listener list, called from `App`'s `useEffect` cleanup to avoid leaking timers on unmount (important under React StrictMode's double-invoke in dev).

## Feed Behavior

- **Auto-scroll**: tracks `scrollHeight - scrollTop - clientHeight` against a 100px threshold (not an exact 0, to tolerate sub-pixel rendering and momentum-scroll settling) to determine "near bottom." New messages auto-scroll only if the user was already near bottom, **or** if the user just sent the message themselves (force-scroll, matching real messaging-app behavior). Otherwise, a "New messages ↓" affordance appears without disrupting scroll position.
- **Timestamp grouping**: a message shows its timestamp only if it's the last in a consecutive run from the same sender (i.e., the next message is from someone else, or it's the last message overall) — computed in `ChatWindow` by comparing each message to its neighbor, since `MessageBubble` only has visibility into a single message.

## Input Handling

`MessageInput` uses a controlled `<textarea>` with:
- `onKeyDown` checking `e.key === 'Enter' && !e.shiftKey` to send (calling `e.preventDefault()` to block the newline), while Shift+Enter falls through to native newline insertion.
- Auto-expand via a `ref` + `useEffect` on `text`: resets `height` to `'auto'` first (so it can shrink back down), then sets it to `scrollHeight`, capped at 150px via `Math.min` with CSS `overflow-y-auto` beyond that.
- Sent message content preserved with `whitespace-pre-wrap` in `MessageBubble` so multi-line messages render correctly (plain HTML collapses `\n` by default).
- Empty/whitespace-only sends blocked via `text.trim() === ''` guard.

## Performance Strategy

1. **`React.memo` on `MessageBubble`.** Without it, any state change in `App` (e.g. `typingUsers` firing every few seconds) re-renders every child, including all message bubbles, regardless of whether their own props changed. Verified via console logging with a 200-message dataset: before optimization, all 200 IDs re-logged on every typing event; after `React.memo`, only genuinely changed messages (new arrivals, status updates) re-rendered.
2. **Reducer discipline enables `memo`.** `React.memo` only helps if props are reference-stable — `chatReducer`'s `UPDATE_STATUS` case returns new object references *only* for the changed message, keeping all others reference-equal across renders.
3. **Virtualization: evaluated, not adopted.** With `React.memo` in place, scrolling through 200+ messages (tested via a temporary bulk-generation seed) remained smooth without `react-window`. Virtualization was skipped because it would add real complexity to the auto-scroll logic (accurately computing `scrollHeight` when off-screen items aren't rendered) without a measurable performance gain at this message-count scale. Would reconsider at a much larger scale (thousands of messages).

## Accessibility

- **ARIA live region**: a visually-hidden (`sr-only`) `<div aria-live="polite" aria-atomic="true">` in `App.tsx`, updated only when `messages.length` changes (not on every `status` tick, to avoid re-announcing the same message repeatedly as it progresses through delivery states).
- **Keyboard operability**: verified `Tab`/`Shift+Tab` cycles correctly between the textarea, Send button, and the conditionally-rendered "New messages ↓" button; `Enter`/`Space` activate focused buttons as expected.
- **Color contrast**: manually calculated WCAG contrast ratios for bubble colors. `bg-blue-500` + white text (initial sent-bubble color) measured ~3.7:1, failing the 4.5:1 AA threshold for normal text — fixed by switching to `bg-blue-600` (~5.2:1, passes). Received bubbles (`bg-gray-200` + black text) measured ~17:1, well above threshold.

## Responsive Design

- Layout uses nested Flexbox (`App` as `flex flex-col h-screen`; `ChatWindow` as `flex-1 flex flex-col min-h-0`, with its internal scroll container also `min-h-0`) so the feed fills available viewport height and the input bar stays pinned at the bottom regardless of message count or textarea expansion. (`min-h-0` overrides Flexbox's default `min-height: auto`, which otherwise prevents nested scroll containers from shrinking correctly.)
- Message bubbles use `max-w-[75%]` (percentage-based) instead of a fixed pixel cap, so bubble width scales naturally across mobile and desktop viewports.

## Known Limitations / Future Improvements

- Fake contacts and reply pool are a small fixed set (`alice`, `bob`) — sufficient for demonstrating the async choreography the assignment evaluates, not meant to simulate a large realistic contact list.
- No persistence — state resets on page reload (not required by spec).        