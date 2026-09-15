Static Vite + React app.

```bash
npm install
npm run dev
```

Live state uses Supabase. Copy `.env.example` to `.env.local` and run `supabase/schema.sql`.

Deploy: Settings → Pages → Source → GitHub Actions, then push `main`.
Add the same two env vars as repo secrets.
