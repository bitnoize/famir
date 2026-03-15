#!/bin/sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

generate() {
  if [ $# -ne 2 ] || [ -z "$1" ] || [ -z "$2" ]; then
    exit 10
  fi

  local source_dir="${SCRIPT_DIR}/$1"
  local target_path="${SCRIPT_DIR}/$2"

  if [ ! -d "$source_dir" ]; then
    exit 20
  fi

  local parts_path=$(mktemp)

  if [ -n "$(ls -A "$source_dir")" ]; then
    for file_path in "$source_dir"/*; do
      local file_name="$(basename "$file_path")"
      local file_body="$(base64 "$file_path")"

      echo "  '${file_name}'," >> "$parts_path"
      echo "  \`${file_body}\`," >> "$parts_path"
      echo >> "$parts_path"
    done
  else
    touch "$parts_path"
  fi

  local parts_body=$(cat "$parts_path")

  cat > "$target_path" << EOF
// Auto-generated file. Do not edit manually!

// prettier-ignore
const REDIS_FUNCTIONS: string[] = [
${parts_body}
]

export function getRedisFunctions(): [string, string][] {
  const entries: [string, string][] = []

  for (let idx = 0; idx < REDIS_FUNCTIONS.length; idx += 2) {
    const name = REDIS_FUNCTIONS[idx]
    const body = REDIS_FUNCTIONS[idx + 1]

    if (name && body) {
      const data = Buffer.from(body, 'base64').toString()
      entries.push([name, data])
    }
  }

  return entries
}
EOF

  rm -f "$parts_path"
}

generate "redis-functions" "src/redis-functions.ts"

exit 0
