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

-- NOTE: the Minesweeper easter-egg high-score table (minesweeper_scores) was
-- retired after the festival - the game no longer records scores. Any existing
-- table is left in place (drop it manually if you want to reclaim the data).

-- ===========================================================================
-- "Notify me about the next festival" signups. After the festival, the site
-- collects people who want to hear about a future event. One row per person.
-- ===========================================================================
create table if not exists public.notify_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  -- Length caps mirror the form's maxLength. The publishable key is public, so
  -- anyone can call the insert API directly - these keep junk rows bounded.
  full_name   text        not null check (char_length(full_name) between 2 and 200),
  email       text        not null check (char_length(email) between 3 and 320),
  phone       text        not null check (char_length(phone) between 7 and 40),
  user_agent  text,
  referrer    text
);

-- One signup per email (case-insensitive). A repeat signup fails with a unique
-- violation, which the site treats as success ("you're already on the list").
create unique index if not exists notify_signups_email_key
  on public.notify_signups (lower(email));

-- Same RLS posture as ticket_clicks: the public (anon) key may INSERT only, and
-- can never read the list back. View it in the Table Editor (service role).
alter table public.notify_signups enable row level security;

drop policy if exists "anon can insert notify signups" on public.notify_signups;
create policy "anon can insert notify signups"
  on public.notify_signups
  for insert
  to anon, authenticated
  with check (true);

create index if not exists notify_signups_created_at_idx
  on public.notify_signups (created_at desc);
