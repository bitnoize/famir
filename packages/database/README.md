# @famir/database

[![npm version](https://img.shields.io/npm/v/@famir/database.svg)](https://www.npmjs.com/package/@famir/database)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Components for working with a database that stores dynamic configuration and state.

## Features

- High performance **Redis** backend.
- Redis-Functions for atomic and isolated operations.
- Consistent relations and validated models.
- Clear error handling with `DatabaseError`.
- Integrated with other packages of the ecosystem.

## Modules

The package is divided into modules, which consist of **contract**, **repository**
and **model**.

### Campaign

Root entity that groups and locks all other resources.

### Proxy

Upstream proxy server for outgoing traffic.

### Target

Maps a public mirror hostname to an internal donor server.

### Redirector

Landing page template with a set of required field names.

### Lure

Links a URL path to a redirector, O(1) path lookup.

### Session

Tracks client session with proxy failover and two‑stage TTL.

### Message

Logs HTTP request/response transactions.
