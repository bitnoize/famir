# @famir/database

[![npm version](https://img.shields.io/npm/v/@famir/database.svg)](https://www.npmjs.com/package/@famir/database)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Database connector, manager, repositories and models

## Features

- TypeScript-first with strict type guards and assertions
- Configuration via `@famir/config` package
- Validates models using `@famir/validator` package
- High performance **Redis** backend
- Redis-Functions for atomic and isolated operations
- Clear error handling with `DatabaseError`
- Integration with `@famir/common` DI container

## Modules

- **Campaign** – root entity that groups and locks all other resources
- **Proxy** – upstream proxy server for outgoing traffic
- **Target** – maps a public mirror hostname to an internal donor server
- **Redirector** – page template with a set of required field names
- **Lure** – links a URL path to a redirector, O(1) path lookup
- **Session** – tracks client session with proxy failover and two‑stage TTL
- **Message** – logs HTTP request/response transactions
