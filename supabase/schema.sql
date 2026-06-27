-- ===========================================================================
-- פסטיבל נוסטלגיה - Supabase schema
-- Run this in the Supabase SQL Editor (see SUPABASE_SETUP.md for full steps).
-- ===========================================================================

-- Table that logs every ticket-purchase intent captured right before the user
-- is redirected to the payment service.
create table if not exists public.ticket_clicks (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz      not null default now(),
  full_name        text             not null,
  email            text,
  age              integer,
  num_tickets      integer          not null,
  companions       text,            -- 'friends' | 'family' | 'kids' | 'solo'
  calculated_price numeric,         -- price shown to the user, in ILS
  user_agent       text,
  referrer         text
);

-- Row Level Security: lock the table down, then allow ONLY anonymous inserts.
-- The browser uses the public "publishable" key (sb_publishable_...), which maps
-- to the Postgres "anon" role - so that role must be allowed to INSERT, but it
-- must NOT be able to read other people's submissions.
alter table public.ticket_clicks enable row level security;

-- Allow anonymous (and logged-in) visitors to insert their own row.
drop policy if exists "anon can insert ticket clicks" on public.ticket_clicks;
create policy "anon can insert ticket clicks"
  on public.ticket_clicks
  for insert
  to anon, authenticated
  with check (true);

-- NOTE: we deliberately create NO select/update/delete policy for anon.
-- With RLS enabled and no such policy, the public key cannot read, change, or
-- delete rows. You (the project owner) can still view everything in the
-- Supabase Table Editor, which uses the privileged service role.

-- Helpful index for browsing recent submissions in the dashboard.
create index if not exists ticket_clicks_created_at_idx
  on public.ticket_clicks (created_at desc);

-- ===========================================================================
-- Minesweeper high-scores: a winning player can register their score for a
-- chance at a prize. One row per registered win.
-- ===========================================================================
create table if not exists public.minesweeper_scores (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz      not null default now(),
  full_name   text             not null,
  email       text,
  duration_ms integer          not null,            -- exact win time, milliseconds
  difficulty  text             not null,            -- 'beginner' | 'intermediate' | 'expert'
  user_agent  text,
  referrer    text
);

-- Same RLS posture as ticket_clicks: the public (anon) key may INSERT only.
alter table public.minesweeper_scores enable row level security;

drop policy if exists "anon can insert minesweeper scores" on public.minesweeper_scores;
create policy "anon can insert minesweeper scores"
  on public.minesweeper_scores
  for insert
  to anon, authenticated
  with check (true);

-- Browse the leaderboard by fastest time per difficulty in the dashboard.
create index if not exists minesweeper_scores_leaderboard_idx
  on public.minesweeper_scores (difficulty, duration_ms asc);
