#!/bin/sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

LUA_SCRIPTS_DIR="${SCRIPT_DIR}/redis-functions"
SOURCE_FILE_PATH="${SCRIPT_DIR}/src/database.redis-functions.ts"

PARTS_FILE_PATH=$(mktemp)

rm -f "$PARTS_FILE_PATH"

for lua_script_path in "$LUA_SCRIPTS_DIR"/*.lua; do
  lua_script_name="$(basename "$lua_script_path")"
  lua_script_data="$(base64 -w 0 "$lua_script_path")"

  echo "  // ${lua_script_name}" >> "$PARTS_FILE_PATH"
  echo "  \`${lua_script_data}\`," >> "$PARTS_FILE_PATH"
  echo >> "$PARTS_FILE_PATH"
done

PARTS_FILE_DATA=$(cat "$PARTS_FILE_PATH")

cat > "$SOURCE_FILE_PATH" << EOF
// Auto-generated file. Do not edit manually!

// prettier-ignore
const REDIS_FUNCTIONS = [
${PARTS_FILE_DATA}
]

export function getRedisFunctions(): string[] {
  return REDIS_FUNCTIONS.map((data) => Buffer.from(data, 'base64').toString())
}
EOF

rm -f "$PARTS_FILE_PATH"

exit 0
