-- Mindtier initial schema.
-- Clients read their own rows through RLS. All writes that affect ratings,
-- leaderboards, duels or entitlements go through the server (service role),
-- which re-verifies every submitted game with @mindtier/core.

create extension if not exists pgcrypto;

-- ── Profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Client-generated seed for deterministic ranked plans (not secret).
  seed text not null check (char_length(seed) between 8 and 64),
  display_name text check (char_length(display_name) between 2 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Ratings ───────────────────────────────────────────────────────────────
create table public.ratings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  domain text not null check (domain in ('memory', 'focus', 'speed', 'logic', 'math')),
  rating double precision not null,
  rd double precision not null,
  volatility double precision not null,
  games integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, domain)
);

create table public.rating_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  domain text not null,
  rating double precision not null,
  rd double precision not null,
  created_at timestamptz not null default now()
);
create index rating_history_user_time on public.rating_history (user_id, created_at desc);

-- ── Sessions and games ────────────────────────────────────────────────────
create table public.sessions (
  -- Client-generated id doubles as an idempotency key for offline uploads.
  id uuid primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null check (mode in ('placement', 'ranked', 'daily', 'duel')),
  seed text not null,
  session_index integer,
  day date not null,
  games text[] not null,
  points integer not null default 0,
  accuracy real not null default 0,
  created_at timestamptz not null default now()
);
create unique index sessions_ranked_index on public.sessions (user_id, session_index) where mode = 'ranked';
create unique index sessions_one_placement on public.sessions (user_id) where mode = 'placement';
create index sessions_user_day on public.sessions (user_id, day);

create table public.game_results (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null,
  mode text not null,
  accuracy real not null,
  points integer not null,
  peak_level integer not null,
  fast_share real not null default 0,
  created_at timestamptz not null default now()
);
create index game_results_user on public.game_results (user_id, created_at desc);

-- ── Daily Challenge ───────────────────────────────────────────────────────
create table public.daily_entries (
  day date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  points integer not null,
  accuracy real[] not null,
  created_at timestamptz not null default now(),
  primary key (day, user_id)
);
create index daily_entries_board on public.daily_entries (day, points desc);

-- ── Duels ─────────────────────────────────────────────────────────────────
create table public.duels (
  id text primary key check (id ~ '^[a-z0-9]{8}$'),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);
create index duels_creator on public.duels (creator_id, created_at desc);

create table public.duel_entries (
  duel_id text not null references public.duels (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  points integer not null,
  accuracy real[] not null,
  created_at timestamptz not null default now(),
  primary key (duel_id, user_id)
);
create index duel_entries_user on public.duel_entries (user_id, created_at desc);

-- ── Entitlements (written by the RevenueCat webhook) ──────────────────────
create table public.entitlements (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  is_pro boolean not null default false,
  plan text,
  product_id text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ── Push tokens ───────────────────────────────────────────────────────────
create table public.push_tokens (
  user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios')),
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);

-- ── Product analytics (anonymous; no PII) ─────────────────────────────────
create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) <= 48),
  props jsonb not null default '{}'::jsonb,
  at timestamptz not null,
  received_at timestamptz not null default now()
);
create index events_name_time on public.events (name, at desc);

-- ── Account deletion requests submitted on the website ────────────────────
create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ── updated_at trigger ────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- ── Row level security ────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.ratings enable row level security;
alter table public.rating_history enable row level security;
alter table public.sessions enable row level security;
alter table public.game_results enable row level security;
alter table public.daily_entries enable row level security;
alter table public.duels enable row level security;
alter table public.duel_entries enable row level security;
alter table public.entitlements enable row level security;
alter table public.push_tokens enable row level security;
alter table public.events enable row level security;
alter table public.deletion_requests enable row level security;

create policy "own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "own ratings" on public.ratings for select to authenticated using (user_id = (select auth.uid()));
create policy "own history" on public.rating_history for select to authenticated using (user_id = (select auth.uid()));
create policy "own sessions" on public.sessions for select to authenticated using (user_id = (select auth.uid()));
create policy "own results" on public.game_results for select to authenticated using (user_id = (select auth.uid()));
create policy "own daily" on public.daily_entries for select to authenticated using (user_id = (select auth.uid()));
create policy "own duels" on public.duels for select to authenticated using (creator_id = (select auth.uid()));
create policy "own duel entries" on public.duel_entries for select to authenticated using (user_id = (select auth.uid()));
create policy "own entitlement" on public.entitlements for select to authenticated using (user_id = (select auth.uid()));
create policy "own push tokens" on public.push_tokens for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- events and deletion_requests: no client policies (server only).

-- Players may only change their display name; everything else is server-owned.
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;
revoke insert, update, delete on public.ratings, public.rating_history, public.sessions, public.game_results,
  public.daily_entries, public.duels, public.duel_entries, public.entitlements, public.events, public.deletion_requests
  from authenticated, anon;
