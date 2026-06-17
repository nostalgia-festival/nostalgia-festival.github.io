-- ===========================================================================
-- קפסולת הזמן — Supabase schema
-- Run this in the Supabase SQL Editor (see SUPABASE_SETUP.md for full steps).
-- ===========================================================================

-- Table that logs every ticket-purchase intent captured right before the user
-- is redirected to the payment service.
create table if not exists public.ticket_clicks (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz      not null default now(),
  full_name        text             not null,
  age              integer,
  num_tickets      integer          not null,
  companions       text,            -- 'friends' | 'family' | 'kids' | 'solo'
  calculated_price numeric,         -- price shown to the user, in ILS
  user_agent       text,
  referrer         text
);

-- Row Level Security: lock the table down, then allow ONLY anonymous inserts.
-- The browser uses the public "anon" key, so it must be allowed to INSERT,
-- but it must NOT be able to read other people's submissions.
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
