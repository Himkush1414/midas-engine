#!/usr/bin/env bash
# Applies every migration to a throwaway Postgres in Docker (with minimal
# Supabase stand-ins), then runs the SQL tests in supabase/tests/*.test.sql.
# Nothing touches the real project. Usage: scripts/db-check.sh
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
cd "$root"
name="mindtier-db-check-$$"

docker run -d --rm --name "$name" -e POSTGRES_PASSWORD=check postgres:17-alpine >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
# TCP only: the image's temporary setup server listens on the socket alone,
# so a TCP connection succeeds only once the real server is up.
sql() { docker exec -i -e PGPASSWORD=check "$name" psql -h 127.0.0.1 -U postgres -v ON_ERROR_STOP=1 -q -X "$@"; }
for _ in $(seq 1 120); do
  if sql -c 'select 1' >/dev/null 2>&1; then break; fi
  sleep 0.5
done

sql < supabase/tests/supabase-stubs.sql
for f in supabase/migrations/*.sql; do
  echo "migrate $(basename "$f")"
  sql < "$f"
done
for f in supabase/tests/*.test.sql; do
  [ -e "$f" ] || continue
  echo "test    $(basename "$f")"
  sql < "$f"
done
echo "db-check: ok"
