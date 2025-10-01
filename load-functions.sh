#!/usr/bin/env bash

for file in packages/database/redis-functions/*.lua; do
  cat "$file" | redis-cli -x FUNCTION LOAD REPLACE
done

exit 0
