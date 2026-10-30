#!/usr/bin/env bash
# Scans what this repo would publish for secrets, tokens, IPs, tailnet names, machine paths, emails and em
# dashes, then for the names in a private deny list (personal hostnames, employer products and clients), which
# stays out of the repo because listing them here would publish them.
#
# Usage: scripts/check-public.sh [--skip-private] [--pushed]
# Without --pushed it scans every file a commit would carry. With --pushed it scans only the lines that the
# commits being pushed add: it reads a pre-push hook's stdin, or, from a terminal, the commits on HEAD that no
# remote branch has. Findings already published then do not block a push.
# Deny list: $CLAUDE_KIT_DENYLIST, or scripts/denylist.local (gitignored). One extended regex per line,
# matched case-insensitively within a line; blank lines and lines starting with # are ignored.
# Repo settings: an optional .check-public file at the top of the repo, one directive per line:
#   ignore <glob>        never scan matching paths (lockfiles, seed data)
#   allow-name <regex>   skip the deny-list line that is exactly <regex> (a name this repo publishes on purpose)
#   warn <label>         report this check without failing the scan (for example: warn em dash)
# A line that contains "check-public: allow" is never reported.
# Exit codes: 0 clean or warnings only, 1 findings, 2 the deny list is missing.
set -euo pipefail

# Git runs hooks from the top of the work tree, and a symlinked hook's own path points into .git/hooks.
root="$(git rev-parse --show-toplevel 2>/dev/null || (cd "$(dirname "$0")/.." && pwd))"
cd "$root"
self="scripts/check-public.sh"
denylist="${CLAUDE_KIT_DENYLIST:-scripts/denylist.local}"
skip_private=0
pushed=0
for arg in "$@"; do
	case "$arg" in
	--skip-private) skip_private=1 ;;
	--pushed) pushed=1 ;;
	esac
done

ignores="" allowed_names="" warns=""
if [ -f .check-public ]; then
	while IFS= read -r line || [ -n "$line" ]; do
		case "$line" in
		'ignore '*) ignores="$ignores${line#ignore }"$'\n' ;;
		'allow-name '*) allowed_names="$allowed_names${line#allow-name }"$'\n' ;;
		'warn '*) warns="$warns${line#warn }"$'\n' ;;
		esac
	done <.check-public
fi

skipped() { # <path>: the scanner, the deny list and the repo's ignore globs
	local glob
	if [ "$1" = "$self" ] || [ "$1" = "$denylist" ]; then return 0; fi
	while IFS= read -r glob; do
		[ -n "$glob" ] || continue
		# shellcheck disable=SC2254
		case "$1" in $glob) return 0 ;; esac
	done <<<"$ignores"
	return 1
}

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
lines="$tmp/lines" # every line to scan, as path:line:content

if [ "$pushed" = 1 ]; then
	zero='^0+$'
	: >"$tmp/revs"
	if [ -t 0 ]; then
		git rev-list HEAD --not --remotes >>"$tmp/revs"
	else
		while read -r _ local_sha _ _; do
			[[ "$local_sha" =~ $zero ]] && continue # a deleted branch publishes nothing
			git rev-list "$local_sha" --not --remotes >>"$tmp/revs"
		done
	fi
	# Merge commits show no patch here: what they bring in is scanned in the commits they merge.
	sort -u "$tmp/revs" | while IFS= read -r rev; do
		git -c core.quotepath=off show --format= --unified=0 --no-color --no-ext-diff "$rev"
	done | awk '
		/^diff --git / { header = 1; path = ""; next }
		header && /^\+\+\+ / { path = ($0 == "+++ /dev/null") ? "" : substr($0, 7); next }
		/^@@ / { header = 0; match($0, /\+[0-9]+/); n = substr($0, RSTART + 1, RLENGTH - 1) + 0; next }
		!header && /^\+/ { if (path != "") print path ":" n ":" substr($0, 2); n++ }
	' >"$tmp/added"
	cut -d: -f1 "$tmp/added" | sort -u | while IFS= read -r path; do
		if skipped "$path"; then printf '%s\n' "$path"; fi
	done >"$tmp/skipped"
	awk -F: -v list="$tmp/skipped" 'BEGIN { while ((getline p <list) > 0) skip[p] = 1 } !($1 in skip)' \
		"$tmp/added" >"$lines"
	scope="$(grep -c . "$lines" || true) added lines"
else
	# The files a commit would carry: tracked plus untracked-but-not-ignored.
	if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
		all=$( { git ls-files; git ls-files --others --exclude-standard; } | sort -u)
	else
		all=$(find . -type f -not -path './.git/*' | sed 's|^\./||')
	fi
	files=$(printf '%s\n' "$all" | while IFS= read -r path; do
		if [ -n "$path" ] && [ -f "$path" ] && ! skipped "$path"; then printf '%s\n' "$path"; fi
	done)
	: >"$lines"
	if [ -n "$files" ]; then
		printf '%s\n' "$files" | tr '\n' '\0' | xargs -0 grep -nIH '' -- >"$lines" 2>/dev/null || true
	fi
	scope="$(printf '%s\n' "$files" | grep -c . || true) files"
fi

found=0
warned=0
report() { # <label> <grep -E flags> <pattern> [exclude pattern, applied to each match]
	local label="$1" flags="$2" pattern="$3" exclude="${4:-}" hits
	# The pattern has to match after the path:line: prefix, so a path alone never counts as a finding.
	# shellcheck disable=SC2086
	hits=$(grep -E $flags -- "^[^:]+:[0-9]+:.*($pattern)" "$lines" | grep -v 'check-public: allow' || true)
	if [ -n "$exclude" ] && [ -n "$hits" ]; then
		# Keep a line only if one of its matches is not excluded: a loopback address next to a real one still counts.
		hits=$(printf '%s\n' "$hits" | while IFS= read -r line; do
			if printf '%s\n' "${line#*:*:}" | grep -oE $flags -- "$pattern" | grep -vqE -- "$exclude"; then
				printf '%s\n' "$line"
			fi
		done)
	fi
	[ -n "$hits" ] || return 0
	if printf '%s' "$warns" | grep -qxF -- "$label"; then
		printf '\n== %s (warning)\n%s\n' "$label" "$hits"
		warned=1
	else
		printf '\n== %s\n%s\n' "$label" "$hits"
		found=1
	fi
}

report "private key" "" '-----BEGIN [A-Z ]*PRIVATE KEY-----'
report "GitHub token" "" '(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}'
report "Anthropic or OpenAI key" "" 'sk-(ant-)?[A-Za-z0-9_-]{20,}'
report "AWS access key" "" '(AKIA|ASIA)[0-9A-Z]{16}'
report "Slack token" "" 'xox[abposr]-[A-Za-z0-9-]{10,}'
report "Google API key" "" 'AIza[0-9A-Za-z_-]{35}'
report "JWT" "" 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.'
report "Infisical token" "" 'st\.[0-9a-f-]{36}\.'
report "Garage key id" "" '\bGK[0-9a-f]{24}\b'
report "long hex secret" "" '\b[0-9a-f]{40,}\b'
report "secret assignment" "-i" '(password|passwd|secret|token|api[_-]?key)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"'[:space:]]{12,}["'"'"']'
report "UUID (project or resource id)" "-i" '\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b'
report "IPv4 address" "" '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' '\b(127\.0\.0\.1|0\.0\.0\.0)\b'
report "tailnet name" "-i" '\.ts\.net\b|\btail[0-9a-f]{5,}\b'
report "machine path" "" '/Users/[A-Za-z]|/home/[a-z]'
report "email address" "-i" '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[a-z]{2,}' '@example\.(com|org|net)|noreply@'
report "em dash" "" '—'

if [ -f "$denylist" ]; then
	while IFS= read -r pattern || [ -n "$pattern" ]; do
		case "$pattern" in '' | '#'*) continue ;; esac
		if printf '%s' "$allowed_names" | grep -qxF -- "$pattern"; then continue; fi
		report "private name /$pattern/" "-i" "$pattern"
	done <"$denylist"
elif [ "$skip_private" = 1 ]; then
	echo "warning: no deny list at $denylist; private names were NOT checked" >&2
else
	echo "error: no deny list at $denylist. Set CLAUDE_KIT_DENYLIST, copy scripts/denylist.example, or pass --skip-private." >&2
	exit 2
fi

if [ "$found" = 1 ]; then
	printf '\ncheck-public: findings above. Fix them, or mark an intended line with "check-public: allow".\n' >&2
	exit 1
fi
echo "check-public: clean ($scope)"
