-- Ratings accept the six skills and nothing else.
do $$
declare
  u uuid := gen_random_uuid();
begin
  insert into auth.users (id) values (u);
  insert into public.profiles (id, seed) values (u, 'seed-domains-1');
  insert into public.ratings (user_id, domain, rating, rd, volatility) values (u, 'language', 1300, 350, 0.06);
  assert (select count(*) from public.ratings where user_id = u and domain = 'language') = 1, 'language ratings are stored';
  begin
    insert into public.ratings (user_id, domain, rating, rd, volatility) values (u, 'cooking', 1300, 350, 0.06);
    assert false, 'unknown domains must be rejected';
  exception when check_violation then
    null;
  end;
end;
$$;
