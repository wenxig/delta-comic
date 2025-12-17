#!/usr/bin/env bash

# Usage: ./getVersion.sh [path/to/package.json]
# If no path provided, search upward from current directory for package.json.

jq_cmd=$(command -v jq || true)
if [ -z "$jq_cmd" ]; then
  echo "jq is required but not installed" >&2
  exit 2
fi

target="${1:-}"

if [ -z "$target" ]; then
  dir="$PWD"
  while :; do
    if [ -f "$dir/package.json" ]; then
      target="$dir/package.json"
      break
    fi
    [ "$dir" = "/" ] && break
    dir=$(dirname "$dir")
  done
fi

if [ -z "$target" ] || [ ! -f "$target" ]; then
  echo "package.json not found" >&2
  exit 1
fi

version=$("$jq_cmd" -r '.version // empty' "$target")
if [ -z "$version" ]; then
  echo "version not found in $target" >&2
  exit 3
fi

echo "$version"
