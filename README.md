# Gmail Command Deck

Focused Gmail dashboard for Primary (CATEGORY_PERSONAL) + `FM360`.

## Setup

1. Create a Google OAuth client with Gmail API enabled.
2. Set the redirect URI to `http://localhost:3000/api/auth/google/callback`.
3. Populate `.env` with your keys.

Required env vars:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `APP_ENC_KEY`

## Database

Generate and apply migrations (Neon):

```bash
bun run db:generate
bun run db:migrate
```

## Run

```bash
bun dev
```

Then visit http://localhost:3000.

## Gmail Auth

Hit **Connect Gmail** in the UI once to store OAuth tokens in Neon. Tokens are encrypted using `APP_ENC_KEY`.

## Notes

- Sync pulls from `in:inbox category:personal` and `label:FM360` and unions threads.
- Reply action asks Reply vs Reply All inside the dialog.
- Summaries and Q&A use the OpenAI API per thread.
