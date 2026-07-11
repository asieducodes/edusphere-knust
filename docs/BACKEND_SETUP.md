# Backend Setup (Supabase)

> This guide will be filled in during Stage 3, once the schema and RLS policies are scaffolded in `backend/supabase/migrations/`.

## Planned steps

1. Create a project at [supabase.com](https://supabase.com).
2. Copy your Project URL and anon public key into `.env` (see `.env.example`).
3. Install the Supabase CLI and link it to your project:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
4. Apply migrations:
   ```bash
   npm run supabase:migrate
   ```
5. Enable email domain restriction for KNUST accounts in Supabase Auth settings.
