#!/usr/bin/env bash
# Commit and push following the project's PUSH_METHOD, step by step.
# Usage: scripts/ship.sh "type(scope): message" [pathspec...]
# With no pathspec every change is staged (git add .); with one, only those paths are.
# The GitHub token is read from .env.local at runtime and passed through a
# one-off credential helper; it is never written to git config or the remote URL.
set -euo pipefail

msg="${1:?commit message required}"
shift
root="$(git rev-parse --show-toplevel)"
cd "$root"

set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

helper='!f() { echo username=x-access-token; echo "password=${GITHUB_TOKEN}"; }; f'
g() { git -c credential.helper= -c "credential.helper=${helper}" "$@"; }

git remote set-url origin https://github.com/Himkush1414/midas-engine.git
git remote -v | head -1
git config user.name >/dev/null || true
git config user.email >/dev/null || true
git config user.name "Himkush1414"
git config user.email "light.dark14143@gmail.com"
if [ "$#" -gt 0 ]; then
  git add -- "$@"
else
  git add .
fi

if git diff --cached --quiet; then
  echo "ship: nothing staged, refusing to create an empty commit" >&2
  exit 1
fi
if git diff --cached --name-only | grep -E '(^|/)(\.env(\..*)?|MIDAS_PRIVATE_NOTES\.md)$' | grep -v '\.env\.example$'; then
  echo "ship: refusing to commit a secret or private file" >&2
  exit 1
fi

git commit -q -m "$msg"
g push -q -u origin main 2>&1 | sed -E 's/(ghp|gho|github_pat)_[A-Za-z0-9_]+/***/g'
git log -1 --format='%an <%ae>'
git log --oneline -1
local_head="$(git rev-parse HEAD)"
remote_head="$(g ls-remote origin main | cut -f1)"
if [ "$local_head" != "$remote_head" ]; then
  echo "ship: remote main ($remote_head) does not match local HEAD ($local_head)" >&2
  exit 1
fi
echo "ship: pushed ${local_head:0:7}"
