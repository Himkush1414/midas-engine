-- The Language skill: a sixth rated domain.
alter table public.ratings drop constraint ratings_domain_check;
alter table public.ratings add constraint ratings_domain_check
  check (domain in ('memory', 'focus', 'speed', 'logic', 'math', 'language'));
