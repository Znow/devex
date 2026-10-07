#!/usr/bin/env bash
# Collects merge status between a chain of main branches and every other branch.
# Run from the target repo root:
#   bash <skill-dir>/scripts/branch-status.sh [-n max-branches] <upstream> <downstream> [<downstream> ...]
# Branches are given in merge-flow order, e.g. origin/release origin/develop origin/feature-x
set -euo pipefail

MAX=40
if [ "${1:-}" = "-n" ]; then MAX=$2; shift 2; fi
if [ $# -lt 2 ]; then
  echo "Usage: $0 [-n max-branches] <upstream> <downstream> [<downstream> ...]" >&2
  exit 1
fi
MAINS=("$@")

git fetch -q --prune origin

echo "## Main branches (flow order)"
for b in "${MAINS[@]}"; do
  echo "$b | $(git log -1 --format='%h %cs %s' "$b")"
done

for ((i = 0; i < ${#MAINS[@]} - 1; i++)); do
  up=${MAINS[$i]}; down=${MAINS[$((i + 1))]}
  echo
  echo "## $up -> $down"
  echo "Missing downstream (in $up, not in $down): $(git rev-list --count --no-merges "$down..$up")"
  echo "Only downstream (in $down, not in $up):    $(git rev-list --count --no-merges "$up..$down")"
  echo "Last common base: $(git log -1 --format='%h %cs' "$(git merge-base "$up" "$down")")"
  echo
  echo "### Missing downstream (first-parent)"
  git log --first-parent --format='%h %cs %s' "$down..$up" | cut -c1-140
  echo
  echo "### Only downstream (first-parent)"
  git log --first-parent --format='%h %cs %s' "$up..$down" | cut -c1-140
done

contains() {
  if git merge-base --is-ancestor "$1" "$2"; then echo Y; else echo "-$(git rev-list --count --no-merges "$2..$1")"; fi
}

is_main() {
  for m in "${MAINS[@]}"; do [ "$m" = "$1" ] || [ "$m" = "origin/$1" ] && return 0; done
  return 1
}

echo
echo "## Branch containment (Y = merged, -N = N commits not merged, -0 = only merge commits missing)"
echo "last commit | branch | author | $(printf '%s | ' "${MAINS[@]}")pushed | subject"
{
  git for-each-ref --format='%(refname:short)' refs/heads
  git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's#^origin/##'
} | grep -v -e '^HEAD$' -e '^origin$' | sort -u | while read -r b; do
  is_main "$b" && continue
  if git rev-parse -q --verify "refs/heads/$b" >/dev/null; then ref=$b; else ref=origin/$b; fi
  pushed=no
  if git rev-parse -q --verify "refs/remotes/origin/$b" >/dev/null; then
    [ "$(git rev-parse "origin/$b")" = "$(git rev-parse "$ref")" ] && pushed=yes || pushed=diverged
  fi
  cols=""
  for m in "${MAINS[@]}"; do cols+="$(contains "$ref" "$m") | "; done
  echo "$(git log -1 --format=%cs "$ref") | $b | $(git log -1 --format=%an "$ref") | ${cols}$pushed | $(git log -1 --format=%s "$ref" | cut -c1-70)"
done | sort -r | head -n "$MAX"
