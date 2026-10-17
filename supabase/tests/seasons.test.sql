-- roll_season applies a soft reset exactly once per player and season.
do $$
declare
  u uuid := gen_random_uuid();
  applied boolean;
  r record;
begin
  insert into auth.users (id) values (u);
  insert into public.profiles (id, seed) values (u, 'seed-season-1');
  insert into public.ratings (user_id, domain, rating, rd, volatility) values
    (u, 'memory', 2000, 50, 0.06),
    (u, 'math', 1200, 60, 0.06);

  applied := public.roll_season(u, 1, '[{"domain":"memory","rating":1930,"rd":80},{"domain":"math","rating":1200,"rd":80},{"domain":"logic","rating":1300,"rd":350}]');
  assert applied, 'first roll applies';
  select rating, rd into r from public.ratings where user_id = u and domain = 'memory';
  assert r.rating = 1930 and r.rd = 80, format('memory reset, got %s/%s', r.rating, r.rd);
  assert (select rating_season from public.profiles where id = u) = 1, 'season recorded';
  assert not exists (select 1 from public.ratings where user_id = u and domain = 'logic'), 'no row invented for an unplayed domain';
  assert (select count(*) from public.rating_history where user_id = u) = 2, 'history gets one point per stored domain';

  applied := public.roll_season(u, 1, '[{"domain":"memory","rating":1000,"rd":80}]');
  assert not applied, 'second roll for the same season is a no-op';
  assert (select rating from public.ratings where user_id = u and domain = 'memory') = 1930, 'ratings unchanged by the repeat';

  assert public.roll_season(u, 2, '[{"domain":"memory","rating":1900,"rd":80}]'), 'next season applies again';
  assert not public.roll_season(u, 1, '[]'), 'an older season never applies';
end;
$$;

-- Only the server (service_role) may call it.
do $$
begin
  assert not has_function_privilege('authenticated', 'public.roll_season(uuid, integer, jsonb)', 'execute'), 'clients cannot roll seasons';
  assert has_function_privilege('service_role', 'public.roll_season(uuid, integer, jsonb)', 'execute'), 'server can roll seasons';
end;
$$;
