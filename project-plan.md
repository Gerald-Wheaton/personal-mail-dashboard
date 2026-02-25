# Gmail Dashboard (Next.js) Plan

## Summary

Build a Next.js (App Router) dashboard that shows only Primary inbox emails plus the `FM360` label, with unread counts, unread sender list, thread summaries, and per-thread Q&A chat. It supports replying to threads, uses Gmail OAuth for a single user (local-only deployment), and caches thread/message data in Neon with encrypted tokens. The UI uses Tailwind + shadcn, with a masculine palette (deep navy, copper, slate, sand) and a clean, uncluttered layout. For undecided UI components, dedicated ideation pages will be created.

## Goals & Success Criteria

- Show only inbox messages in Gmail Primary category (`CATEGORY_PERSONAL`) and messages with label `FM360`.
- Display unread count and a list of unread senders (grouped by email address).
- Thread detail view with message timeline, summary, and chat panel for Q&A.
- Reply functionality (ask whether Reply or Reply All each time).
- Uncluttered, highly readable UI vs Gmail.
- Local-only deployment, single-user OAuth.

## Key Decisions (from your responses)

- Gmail auth: Single-user OAuth.
- Data: On-demand fetch with caching in Neon.
- AI: Per-thread summaries + chat.
- Label: `FM360`.
- Unread grouping: by sender email address.
- Deployment: local only.
- Inbox filter: Gmail category `CATEGORY_PERSONAL` (Primary).
- Reply behavior: ask each time.
- Compose: replies only (no new-email compose).
- OpenAI model: `gpt-4o-mini`.
- Token storage: encrypted in Neon.

## Architecture Overview

- **Frontend**: Next.js App Router + Tailwind + shadcn UI.
- **Backend**: Next.js route handlers for OAuth, Gmail fetch, thread detail, reply send, summary generation, and chat.
- **Data**: Neon Postgres for cached threads/messages, summaries, and chat sessions/messages.
- **AI**: OpenAI API for summarization and per-thread Q&A (retrieves the thread’s full message chain as context).

## Public APIs / Interfaces

- **Route Handlers**
  1. `GET /api/auth/google/start` — start OAuth
  2. `GET /api/auth/google/callback` — OAuth callback, store tokens (encrypted)
  3. `POST /api/sync` — fetch latest threads (Primary inbox + FM360), update cache
  4. `GET /api/threads` — list threads with unread status, preview data
  5. `GET /api/threads/[id]` — thread detail + messages + summary + chat history
  6. `POST /api/threads/[id]/reply` — send reply or reply-all
  7. `POST /api/threads/[id]/summary` — generate/update summary
  8. `POST /api/threads/[id]/chat` — submit a question, return answer + store chat

- **Types**
  - `ThreadSummary`: `{ threadId, summaryText, updatedAt }`
  - `UnreadSender`: `{ email, name?, unreadCount }`
  - `ChatMessage`: `{ id, threadId, role, content, createdAt }`

## Data Model (Neon)

- `oauth_tokens`
  - `id`, `provider`, `access_token`, `refresh_token`, `expiry`, `encrypted_at`, `created_at`, `updated_at`
- `threads`
  - `id`, `gmail_thread_id`, `subject`, `snippet`, `last_message_at`, `unread_count`, `labels`, `updated_at`
- `messages`
  - `id`, `gmail_message_id`, `thread_id`, `from_email`, `from_name`, `to`, `cc`, `bcc`, `subject`, `date`, `body_text`, `body_html`, `is_unread`, `labels`
- `summaries`
  - `thread_id`, `summary_text`, `updated_at`
- `chat_sessions`
  - `id`, `thread_id`, `created_at`
- `chat_messages`
  - `id`, `session_id`, `role`, `content`, `created_at`

## Gmail Query Logic

- Primary inbox: `in:inbox category:personal`
- FM360 label: `label:FM360`
- Use two list calls (threads or messages) and union by `threadId`.
- Store labels to mark visibility and unread status.

## UI Structure

- **Dashboard page** (`/`)
  - Left: thread list (minimal, readable cards)
  - Center: thread detail view
  - Right: summary + chat panel
  - Top: unread count + unread senders widget + sync button

- **Thread list**
  - Subject, sender, time, unread badge, small snippet
  - Clean whitespace, strong contrast

- **Thread detail**
  - Message timeline, collapsible items
  - Reply action prompts Reply vs Reply All

- **Summary**
  - Current summary + refresh button

- **Chat panel**
  - Ask questions about thread; show conversation

## Ideation Pages (for undecided components)

Create pages with 2–3 design options each:

- `/thread-list-ideation`
- `/thread-detail-ideation`
- `/unread-senders-ideation`
- `/summary-card-ideation`
- `/chat-panel-ideation`

## Visual Design Direction

- Palette: deep navy, slate, copper, sand, and muted teal accents.
- Typography: expressive but readable (avoid default system stack; use a distinct serif + sans pairing).
- Background: subtle gradient or textured pattern for atmosphere.
- Motion: entrance fade/slide, staggered list reveal.

## Env Vars

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `APP_ENC_KEY` (for token encryption)

## Testing & Acceptance

- Unit tests:
  - Gmail query builder (Primary + FM360 union)
  - Token encryption/decryption
- Integration tests:
  - Mock Gmail API: thread list + message fetch + reply send
  - OpenAI summary + chat (mock)
- UI acceptance:
  - Unread count matches unread messages
  - Unread sender list correct
  - Thread summary appears and updates
  - Chat answers reference thread content
  - Reply send flow works with prompt for Reply/Reply All

## Assumptions & Defaults

- Single user, local-only deployment.
- Label is exactly `FM360`.
- “Main inbox” = Gmail Primary category (`CATEGORY_PERSONAL`).
- Replies only; no new email compose.
- Tokens are stored encrypted in Neon using `APP_ENC_KEY`.
