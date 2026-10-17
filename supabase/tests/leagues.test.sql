-- Weekly leagues: opt-in, one scoring session per day, group size, standings.
create function pg_temp.player(p_name text, p_opt boolean) returns uuid language plpgsql as $$
declare u uuid := gen_random_uuid();
begin
  insert into auth.users (id) values (u);
  insert into public.profiles (id, seed, display_name, league_opt_in) values (u, 'seed-' || left(u::text, 8), p_name, p_opt);
  return u;
end;
$$;

do $$
declare
  a uuid := pg_temp.player('Ada', true);
  b uuid := pg_temp.player('Bo', true);
  out_ uuid := pg_temp.player('Cy', false);
  r jsonb;
  s jsonb;
begin
  -- Not opted in: nothing recorded.
  r := public.league_record(out_, '2026-10-19', '2026-10-19', 3::smallint, 900);
  assert (r ->> 'counted')::boolean = false and r -> 'group_id' = 'null'::jsonb, 'opted-out players are ignored';
  assert not exists (select 1 from public.league_members where user_id = out_), 'no membership for opted-out players';
  assert public.league_standings(out_, '2026-10-19') is null, 'no standings without a group';

  -- First session of the day scores and joins a group; a second one the same day does not score.
  r := public.league_record(a, '2026-10-19', '2026-10-19', 3::smallint, 900);
  assert (r ->> 'counted')::boolean, 'first session of the day counts';
  r := public.league_record(a, '2026-10-19', '2026-10-19', 3::smallint, 5000);
  assert not (r ->> 'counted')::boolean, 'second session the same day does not count';
  perform public.league_record(a, '2026-10-19', '2026-10-20', 3::smallint, 700);
  perform public.league_record(b, '2026-10-19', '2026-10-19', 3::smallint, 1000);

  s := public.league_standings(a, '2026-10-19');
  assert (s ->> 'size')::int = 2, format('two members, got %s', s);
  assert s -> 'members' -> 0 ->> 'name' = 'Ada' and (s -> 'members' -> 0 ->> 'points')::int = 1600, format('Ada leads with 1600: %s', s);
  assert (s -> 'members' -> 0 ->> 'days')::int = 2, 'Ada scored on two days';
  assert (s -> 'members' -> 0 ->> 'me')::boolean and not (s -> 'members' -> 1 ->> 'me')::boolean, 'me flag marks the caller';
  assert (s -> 'members' -> 1 ->> 'place')::int = 2, 'Bo is second';

  -- A different tier band gets its own group.
  update public.profiles set league_opt_in = true where id = out_;
  r := public.league_record(out_, '2026-10-19', '2026-10-19', 6::smallint, 300);
  assert (r ->> 'counted')::boolean, 'joins once opted in';
  assert (select count(distinct group_id) from public.league_members where week = '2026-10-19') = 2, 'bands do not mix';

  -- A new week starts a new membership.
  r := public.league_record(a, '2026-10-26', '2026-10-26', 3::smallint, 400);
  assert (public.league_standings(a, '2026-10-26') ->> 'size')::int = 1, 'fresh group next week';
end;
$$;

-- Groups never exceed the size limit.
do $$
declare
  i int;
  u uuid;
begin
  for i in 1..7 loop
    u := pg_temp.player('P' || i, true);
    perform public.league_record(u, '2026-11-02', '2026-11-02', 1::smallint, i * 10, 3);
  end loop;
  assert (select count(*) from public.league_groups where week = '2026-11-02' and band = 1) = 3, 'seven players in groups of three need three groups';
  assert (select max(c) from (select count(*) c from public.league_members where week = '2026-11-02' group by group_id) t) = 3, 'no group above the limit';
end;
$$;

-- Deleting an account removes its league rows.
do $$
declare u uuid := pg_temp.player('Del', true);
begin
  perform public.league_record(u, '2026-11-09', '2026-11-09', 2::smallint, 100);
  delete from auth.users where id = u;
  assert not exists (select 1 from public.league_members where user_id = u), 'membership deleted with the account';
  assert not exists (select 1 from public.league_days where user_id = u), 'scored days deleted with the account';
end;
$$;

-- Server only.
do $$
begin
  assert not has_function_privilege('authenticated', 'public.league_record(uuid, date, date, smallint, integer, integer)', 'execute'), 'clients cannot record';
  assert not has_function_privilege('authenticated', 'public.league_standings(uuid, date)', 'execute'), 'clients cannot read standings directly';
  assert not has_table_privilege('authenticated', 'public.league_members', 'select'), 'clients cannot read members';
end;
$$;
