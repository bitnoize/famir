# @famir/database

## 0.0.8

### Patch Changes

- Added history for sessions and messages.
- Session revocation logic added.
- Updated dependencies:
  - @famir/http-tools@0.0.9
  - @famir/domain@0.0.2

## 0.0.7

### Patch Changes

- Moved domain layer to separate package.
- Updated dependencies:
  - @famir/http-tools@0.0.8
  - @famir/common@0.0.7
  - @famir/domain@0.0.1

## 0.0.6

### Patch Changes

- Clean error handling, DatabaseError static helpers.
- Refactor connect/close methods in RedisDatabaseConnector.
- Fix typedoc build warnings.
- Updated dependencies:
  - @famir/validator@0.0.6
  - @famir/common@0.0.6
  - @famir/config@0.0.5
  - @famir/logger@0.0.5
  - @famir/http-proto@0.0.4
