#!/bin/sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

LUA_SCRIPTS_DIR="${SCRIPT_DIR}/redis-functions"
INPUT_RDB_FILE="${SCRIPT_DIR}/redis-functions-dump.rdb"
OUTPUT_SRC_FILE="${SCRIPT_DIR}/src/redis-functions-dump.ts"

for file in "$LUA_SCRIPTS_DIR"/*.lua; do
  cat "$file" | redis-cli $REDIS_OPTS -x FUNCTION LOAD REPLACE
done

redis-cli $REDIS_OPTS FUNCTION DUMP > "$INPUT_RDB_FILE"

REDIS_FUNCTION_DUMP="$(base64 -i "$INPUT_RDB_FILE")"

cat > "$OUTPUT_SRC_FILE" << EOF
// Auto-generated file. Do not edit manually!

const REDIS_FUNCTIONS_DUMP = \`
${REDIS_FUNCTION_DUMP}
\`

export function getRedisFunctionsDump(): Buffer {
  return Buffer.from(REDIS_FUNCTIONS_DUMP, 'base64')
}
EOF

rm -f "$INPUT_RDB_FILE"

exit 0
