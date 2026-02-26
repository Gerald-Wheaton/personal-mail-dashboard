# Gmail Command Deck - Claude Instructions

## Project Overview

A personal Gmail dashboard for managing Primary and FM360-labeled emails with AI-powered summaries and Q&A. Single-user app — no multi-tenancy.

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript strict mode
- **Package Manager:** Bun (always use `bun` not `npm`/`yarn`)
- **Styling:** Tailwind CSS v4 + shadcn/ui (new-york style, neutral palette, lucide icons)
- **Database:** PostgreSQL via Neon + Drizzle ORM (`lib/schema.ts`)
- **Auth:** Google OAuth 2.0 with encrypted token storage (AES-256-GCM)
- **AI:** OpenAI SDK (`gpt-4o-mini` default, configurable via `OPENAI_MODEL`)
- **Gmail:** googleapis library (v1 API)

## Project Structure

```
app/
  api/
    auth/google/start/    # OAuth flow initiation
    auth/google/callback/ # OAuth callback + token save
    sync/                 # Fetch & upsert threads from Gmail
    threads/              # List threads with filters/pagination
    threads/[id]/         # Get thread detail
    threads/[id]/summary/ # Generate/fetch AI summary
    threads/[id]/chat/    # Q&A about thread
    threads/[id]/reply/   # Send reply/reply-all
  *-ideation/             # Dev-only demo pages for individual components
components/
  dashboard/              # All main UI components
  ui/                     # shadcn/ui primitives
lib/
  schema.ts               # Drizzle table definitions
  db.ts                   # DB connection
  gmail.ts                # Gmail API client + OAuth + token management
  gmail-parsers.ts        # MIME parsing, header extraction
  openai.ts               # OpenAI client
  crypto.ts               # AES-256-GCM encryption for tokens
  env.ts                  # Zod-validated env vars
  types.ts                # Shared TypeScript types
drizzle/                  # Generated migration files
```

## Key Components

- **`Dashboard.tsx`** — Parent orchestrator; owns all state, three-column grid layout
- **`ThreadList.tsx`** — Left: list with search, label filter, date range, unread toggle, pagination
- **`ThreadDetail.tsx`** — Center: conversation view, reply dialog, footer/signature parsing
- **`SummaryCard.tsx`** — Right: AI summary with refresh; handles OpenAI quota errors
- **`ChatPanel.tsx`** — Right: Q&A interface with conversation history
- **`UnreadSenders.tsx`** — Overview: total unread + top senders
- **`TopBar.tsx`** — Header with Connect Gmail + Sync Now actions

## Database Schema (Drizzle)

- `oauth_tokens` — encrypted Google OAuth tokens (keyed by provider)
- `threads` — Gmail thread metadata
- `messages` — Individual messages with full headers, body, RFC fields
- `summaries` — AI-generated summaries (one per thread)
- `chatMessages` — Q&A conversation history

## Environment Variables

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini        # optional
DATABASE_URL=                    # Neon PostgreSQL
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
APP_ENC_KEY=                     # 32+ byte key for AES-256-GCM
```

## Dev Commands

```bash
bun dev              # Start dev server (localhost:3000)
bun run build        # Production build
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run lint         # ESLint
```

## Conventions & Patterns

- **State management:** React hooks only — no external state library
- **Error handling:** Normalize API errors with `code`, `status`, `message`; detect Gmail API not enabled, missing tokens, OpenAI quota (429) specifically
- **Gmail labels:** `category:personal` (system) and `label:FM360` (custom)
- **Reply construction:** RFC 2822 compliant headers (In-Reply-To, References)
- **Token security:** Always encrypt/decrypt with `lib/crypto.ts` — never store raw tokens
- **Type safety:** All DB tables typed via Drizzle; request/response shapes in `lib/types.ts`
- **Path alias:** `@/*` maps to project root

## shadcn/ui

- Style: `new-york`
- Base color: `neutral`
- Icons: `lucide`
- Add components: `bunx shadcn add <component>`

## Notes

- Ideation pages (`*-ideation`) are dev-only for component testing; they use `IdeationNavbar.tsx`
- The `drizzle/` folder contains generated migrations — commit these
- Single OAuth token record per provider ("google") — no per-user tokens
