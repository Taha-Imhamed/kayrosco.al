# Kayrosco Agent Setup

## Environment variables

Set these in your local environment and in Vercel:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=gemini
GEMINI_API_KEY=
XAI_API_KEY=
```

Notes:

- `AI_PROVIDER=gemini` is the default path.
- If `AI_PROVIDER=grok`, set `XAI_API_KEY`.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `XAI_API_KEY` in frontend variables.

## Supabase

1. Run [supabase/agent_system.sql](/c:/Users/tahah/Downloads/kayrosco-pushi-main/kayrosco-pushi-main/supabase/agent_system.sql).
2. Confirm the `agent-documents` storage bucket exists.
3. Keep the existing frontend on `VITE_SUPABASE_*`.
4. Keep server routes on `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Public website

- The floating agent widget appears on `/`, `/travel`, and `/consulting`.
- Leads, conversations, and uploaded files are saved through `/api/agent/*`.

## Admin dashboard

- New routes:
  - `/memo/agent`
  - `/memo/agent/work`
- `Agent` is the ChatGPT-style worker assistant.
- `Agent Work` is the CRM-style queue for saved requests.

## API routes

- `POST /api/agent/message`
- `POST /api/agent/lead`
- `POST /api/agent/upload`
- `GET /api/agent/work`
- `POST /api/agent/status`
- `POST /api/agent/assign`
- `POST /api/agent/note`
- `GET /api/agent/config`

## Current limitation

The existing admin auth in this repo is client-side session storage, not server-validated auth. The new API routes keep provider keys and the Supabase service role on the server, but internal route authorization still inherits that broader repo limitation.
