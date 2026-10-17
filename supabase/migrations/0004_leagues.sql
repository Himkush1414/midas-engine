-- Opt-in weekly leagues. Players who opt in are placed, on their first
-- scoring session of a UTC week, into a group of up to 30 players from the
-- same tier band. Only the first ranked session of each UTC day scores, so
-- free and Pro players compete on equal terms. Everything is server-written.

alter table public.profiles add column league_opt_in boolean not null default false;

create table public.league_groups (
  id bigint generated always as identity primary key,
  week date not null,
  band smallint not null check (band between 0 and 7),
  created_at timestamptz not null default now()
);
create index league_groups_open on public.league_groups (week, band, id);

create table public.league_members (
  week date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_id bigint not null references public.league_groups (id) on delete cascade,
  points integer not null default 0,
  days integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (week, user_id)
);
create index league_members_group on public.league_members (group_id, points desc);

-- One scoring session per player per UTC day.
create table public.league_days (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

alter table public.league_groups enable row level security;
alter table public.league_members enable row level security;
alter table public.league_days enable row level security;
-- No client policies: standings are served by the API.
revoke all on public.league_groups, public.league_members, public.league_days from anon, authenticated;

-- Count one finished ranked session toward the player's league. Joins a
-- group first if needed. Returns {"counted": bool, "group_id": id|null}.
create or replace function public.league_record(
  p_user uuid,
  p_week date,
  p_day date,
  p_band smallint,
  p_points integer,
  p_size integer default 30
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group bigint;
  v_rows integer;
begin
  if not exists (select 1 from public.profiles where id = p_user and league_opt_in) then
    return jsonb_build_object('counted', false, 'group_id', null);
  end if;

  select group_id into v_group from public.league_members where week = p_week and user_id = p_user;
  if v_group is null then
    -- Serialise group filling per week and band so groups never exceed p_size.
    perform pg_advisory_xact_lock(hashtext('league'), hashtext(p_week::text || ':' || p_band::text));
    select g.id into v_group
    from public.league_groups g
    where g.week = p_week and g.band = p_band
      and (select count(*) from public.league_members m where m.group_id = g.id) < p_size
    order by g.id
    limit 1;
    if v_group is null then
      insert into public.league_groups (week, band) values (p_week, p_band) returning id into v_group;
    end if;
    insert into public.league_members (week, user_id, group_id) values (p_week, p_user, v_group)
    on conflict (week, user_id) do nothing;
    select group_id into v_group from public.league_members where week = p_week and user_id = p_user;
  end if;

  insert into public.league_days (user_id, day) values (p_user, p_day) on conflict do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return jsonb_build_object('counted', false, 'group_id', v_group);
  end if;
  update public.league_members
  set points = points + greatest(p_points, 0), days = days + 1, updated_at = now()
  where week = p_week and user_id = p_user;
  return jsonb_build_object('counted', true, 'group_id', v_group);
end;
$$;

-- The caller's group for a week, best first; null when they are not in one.
create or replace function public.league_standings(p_user uuid, p_week date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_group bigint;
  v_band smallint;
begin
  select m.group_id, g.band into v_group, v_band
  from public.league_members m join public.league_groups g on g.id = m.group_id
  where m.week = p_week and m.user_id = p_user;
  if v_group is null then
    return null;
  end if;
  return (
    select jsonb_build_object(
      'week', p_week,
      'band', v_band,
      'size', count(*),
      'members', jsonb_agg(
        jsonb_build_object('place', r.place, 'name', r.name, 'points', r.points, 'days', r.days, 'me', r.user_id = p_user)
        order by r.place, r.name
      )
    )
    from (
      select m.user_id, m.points, m.days, coalesce(p.display_name, 'Player') as name,
             rank() over (order by m.points desc) as place
      from public.league_members m
      join public.profiles p on p.id = m.user_id
      where m.group_id = v_group
    ) r
  );
end;
$$;

revoke all on function public.league_record(uuid, date, date, smallint, integer, integer) from public, anon, authenticated;
revoke all on function public.league_standings(uuid, date) from public, anon, authenticated;
grant execute on function public.league_record(uuid, date, date, smallint, integer, integer) to service_role;
grant execute on function public.league_standings(uuid, date) to service_role;
