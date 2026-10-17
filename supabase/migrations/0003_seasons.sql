-- Monthly seasons. The server brings a player's ratings into the current
-- season (one soft reset, computed by @mindtier/core) the first time it sees
-- them after the season changes. `rating_season` records which season the
-- stored ratings belong to; 0 is the preseason.

alter table public.profiles add column rating_season integer not null default 0;

-- Applies a precomputed soft reset exactly once per player and season.
-- Returns false when another request already rolled this player forward.
create or replace function public.roll_season(p_user uuid, p_season integer, p_ratings jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  -- The conditional update takes the row lock, so concurrent requests apply the reset once.
  update public.profiles set rating_season = p_season where id = p_user and rating_season < p_season;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  -- Domains without a row still hold starting ratings, which the reset leaves unchanged.
  update public.ratings r
  set rating = (x ->> 'rating')::float8, rd = (x ->> 'rd')::float8, updated_at = now()
  from jsonb_array_elements(p_ratings) x
  where r.user_id = p_user and r.domain = x ->> 'domain';

  insert into public.rating_history (user_id, domain, rating, rd)
  select p_user, r.domain, r.rating, r.rd
  from public.ratings r
  where r.user_id = p_user;

  return true;
end;
$$;

revoke all on function public.roll_season(uuid, integer, jsonb) from public, anon, authenticated;
grant execute on function public.roll_season(uuid, integer, jsonb) to service_role;
