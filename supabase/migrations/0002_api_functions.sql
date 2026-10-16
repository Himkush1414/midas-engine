-- Server-side functions called by the API with the service role.

-- Atomically records one verified session and everything derived from it.
-- Returns 'ok', or 'duplicate' when the session id was already recorded
-- (offline uploads may be retried).
create or replace function public.submit_session(
  p_user uuid,
  p_session jsonb,
  p_ratings jsonb,
  p_results jsonb,
  p_daily jsonb default null,
  p_duel jsonb default null
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer;
begin
  insert into public.sessions (id, user_id, mode, seed, session_index, day, games, points, accuracy)
  values (
    (p_session ->> 'id')::uuid,
    p_user,
    p_session ->> 'mode',
    p_session ->> 'seed',
    nullif(p_session ->> 'session_index', '')::integer,
    (p_session ->> 'day')::date,
    array(select jsonb_array_elements_text(p_session -> 'games')),
    (p_session ->> 'points')::integer,
    (p_session ->> 'accuracy')::real
  )
  on conflict (id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 'duplicate';
  end if;

  insert into public.game_results (session_id, user_id, game_id, mode, accuracy, points, peak_level, fast_share)
  select (p_session ->> 'id')::uuid, p_user, r ->> 'game_id', p_session ->> 'mode',
         (r ->> 'accuracy')::real, (r ->> 'points')::integer, (r ->> 'peak_level')::integer, (r ->> 'fast_share')::real
  from jsonb_array_elements(p_results) r;

  if jsonb_array_length(coalesce(p_ratings, '[]'::jsonb)) > 0 then
    insert into public.ratings (user_id, domain, rating, rd, volatility, games, updated_at)
    select p_user, r ->> 'domain', (r ->> 'rating')::float8, (r ->> 'rd')::float8, (r ->> 'volatility')::float8,
           (r ->> 'games')::integer, now()
    from jsonb_array_elements(p_ratings) r
    on conflict (user_id, domain) do update
      set rating = excluded.rating, rd = excluded.rd, volatility = excluded.volatility,
          games = public.ratings.games + excluded.games, updated_at = now();

    insert into public.rating_history (user_id, domain, rating, rd)
    select p_user, r ->> 'domain', (r ->> 'rating')::float8, (r ->> 'rd')::float8
    from jsonb_array_elements(p_ratings) r;
  end if;

  if p_daily is not null then
    insert into public.daily_entries (day, user_id, points, accuracy)
    values ((p_daily ->> 'day')::date, p_user, (p_daily ->> 'points')::integer,
            array(select (x)::real from jsonb_array_elements_text(p_daily -> 'accuracy') x))
    on conflict (day, user_id) do nothing;
  end if;

  if p_duel is not null then
    insert into public.duel_entries (duel_id, user_id, points, accuracy)
    values (p_duel ->> 'duel_id', p_user, (p_duel ->> 'points')::integer,
            array(select (x)::real from jsonb_array_elements_text(p_duel -> 'accuracy') x))
    on conflict (duel_id, user_id) do nothing;
  end if;

  return 'ok';
end;
$$;

-- Daily leaderboard: top N plus the caller's own placing.
create or replace function public.daily_board(p_day date, p_user uuid, p_limit integer default 50)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with ranked as (
    select e.user_id, e.points, e.accuracy, coalesce(p.display_name, 'Player') as name,
           rank() over (order by e.points desc) as place,
           count(*) over () as total
    from public.daily_entries e
    join public.profiles p on p.id = e.user_id
    where e.day = p_day
  )
  select jsonb_build_object(
    'total', coalesce((select max(total) from ranked), 0),
    'top', coalesce((select jsonb_agg(jsonb_build_object('place', place, 'name', name, 'points', points, 'me', user_id = p_user) order by place)
                     from (select * from ranked order by place limit p_limit) t), '[]'::jsonb),
    'me', (select jsonb_build_object('place', place, 'points', points, 'total', total) from ranked where user_id = p_user)
  );
$$;

revoke all on function public.submit_session(uuid, jsonb, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.daily_board(date, uuid, integer) from public, anon, authenticated;
grant execute on function public.submit_session(uuid, jsonb, jsonb, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.daily_board(date, uuid, integer) to service_role;
