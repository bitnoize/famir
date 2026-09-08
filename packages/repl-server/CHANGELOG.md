# @famir/repl-server

## 0.0.6

### Patch Changes

- Re-work a server from node:repl to node:readline
- Moved domain layer to separate package.
- Updated dependencies:
  - @famir/common@0.0.7
  - @famir/domain@0.0.1

## 0.0.5

### Patch Changes

- Clean error handling, ReplServerError static helpers.
- Refactor listen/close methods in NetReplServer.
- Extracting command logic into a separate class.
- Added assets map wrapper.
- Fix typedoc build warnings.
- Updated dependencies:
  - @famir/validator@0.0.6
  - @famir/common@0.0.6
  - @famir/config@0.0.5
  - @famir/logger@0.0.5
