#!/usr/bin/env bash
# Typecheck, lint and test one or more workspaces; exits non-zero on the first failure.
# Usage: scripts/verify.sh [core|mobile|web|all]...   (default: all)
set -euo pipefail
export PATH="$HOME/.local/node-linux/bin:$PATH"
root="$(git rev-parse --show-toplevel)"
targets=("${@:-all}")
[ "${targets[0]}" = "all" ] && targets=(core mobile web)

log="$(mktemp)"
trap 'rm -f "$log"' EXIT
step() {
  local name="$1"; shift
  if "$@" >"$log" 2>&1; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name" >&2
    tail -40 "$log" >&2
    exit 1
  fi
}

for t in "${targets[@]}"; do
  case "$t" in
    core)
      echo "core"
      cd "$root/packages/core"
      step typecheck npx tsc --noEmit
      step test npx vitest run
      ;;
    mobile)
      echo "mobile"
      cd "$root/apps/mobile"
      step typecheck npx tsc --noEmit
      step lint npx expo lint --max-warnings 0
      step test npx jest --silent
      ;;
    web)
      echo "web"
      cd "$root/apps/web"
      step typecheck npx tsc --noEmit
      step lint npx eslint --max-warnings 0
      step test npx vitest run
      ;;
    *) echo "unknown target $t" >&2; exit 2 ;;
  esac
done
