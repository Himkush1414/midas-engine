-- Just enough of Supabase for the migrations to apply to a plain Postgres
-- (used by scripts/db-check.sh; never applied to the real project).
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid());
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
