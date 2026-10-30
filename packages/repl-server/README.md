# @famir/repl-server

[![npm version](https://img.shields.io/npm/v/@famir/repl-server.svg)](https://www.npmjs.com/package/@famir/repl-server)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Interactive REPL server for the **Famir** platform.

This package provides a shared command-driven REPL layer for local administration and runtime
control. It supports both terminal-style Cli REPL and socket-based Net REPL servers, with a command
router, typed argument parsing, and reusable server assets.

## Purpose

- Interactive command prompt.
- Reusable command router.
- Compose help screen with command usage.
- Cli and Net server implementations.
- Assets with default server welcome and leave banners.

## Structure

The package is structured as:

- `src/repl-server.ts` — Common types and definitions.
- `src/repl-server.schemas.ts` — Various validation schema.
- `src/repl-server-assets.ts` — Static assets registry.
- `src/repl-server-command.ts` — Typed command definition and argument parsing.
- `src/repl-server-router.ts` — Command registration and lookup.
- `src/base-repl-server.ts` — Shared REPL runtime logic.
- `src/cli-repl-server.ts` — Cli REPL server implementation.
- `src/net-repl-server.ts` — Net REPL server implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `ReplServer` via `REPL_SERVER` token
- `ReplServerAssets` via `REPL_SERVER_ASSETS` token
- `ReplServerRouter` via `REPL_SERVER_ROUTER` token

## Installation

```sh
npm install @famir/repl-server
```

## Configuration (Cli server)

Expects the following configuration variables:

- `REPL_SERVER_USE_COLORS` - whether to use ANSI colors, default: `true`

Example:

```sh
REPL_SERVER_USE_COLORS="true"
```

## Configuration (Net server)

Expects the following configuration variables:

- `REPL_SERVER_ADDRESS` - listening address, default: `127.0.0.1`
- `REPL_SERVER_PORT` - listening port, default: `5000`
- `REPL_SERVER_MAX_CLIENTS` - maximum number of concurrent clients, default: `10`
- `REPL_SERVER_SOCKET_TIMEOUT` - socket timeout in milliseconds, default: `15000`
- `REPL_SERVER_USE_COLORS` - whether to use ANSI colors, default: `true`

Example:

```sh
REPL_SERVER_ADDRESS="127.0.0.1"
REPL_SERVER_PORT="5000"
REPL_SERVER_MAX_CLIENTS="10"
REPL_SERVER_SOCKET_TIMEOUT="15000"
REPL_SERVER_USE_COLORS="true"
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'
import { PinoLogger } from '@famir/logger'
import { EtaTemplater } from '@famir/templater'
import {
  ReplServerAssets,
  ReplServerRouter,
  CliReplServer, // use Cli server
  //NetReplServer, // ... or Net server
} from '@famir/repl-server'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Define your assets:
const assets: [string, string][] = [['hello.txt', `Hi, there!`]]

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
EtaTemplater.register(container)
ReplServerAssets.register(container, assets)
ReplServerRouter.register(container)
// Register Cli server
CliReplServer.register(container)
// ... or Net server
//NetReplServer.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { Validator, VALIDATOR, ReplServer, REPL_SERVER } from '@famir/domain'
import {
  type ReplServerAssets,
  REPL_SERVER_ASSETS,
  type ReplServerRouter,
  REPL_SERVER_ROUTER,
} from '@famir/repl-server'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependencies:
const validator = container.resolve<Validator>(VALIDATOR)
const assets = container.resolve<ReplServerAssets>(REPL_SERVER_ASSETS)
const router = container.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
const replServer = container.resolve<ReplServer>(REPL_SERVER)
```

## ReplServerAssets

The assets is a collection of static text files that are added during the application build process.

```ts
const text = assets.get('hello.txt')
console.log(text) // 'Hi, there!'
```

## ReplServerRouter

The router acts as root of a REPL server and handles the routing commants to their respective
handlers.

```ts
// Your command args interface:
interface TestCommandArgs {
  _: [string]
}

// Your command args schema:
const testCommandArgsSchema: JSONSchemaType<TestCommandArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [{ type: 'string' }],
      minItems: 1,
      maxItems: 1,
    },
  },
  additionalProperties: false,
} as const

// Add schema to validator
this.validator.addSchema('test-command-args', testCommandArgsSchema)

// Add custom command
router.addCommand<TestCommandArgs>(
  {
    name: 'test',
    description: `Test command that echo first param`,
    schemaName: 'test-command-args',
    options: [],
    params: ['echo'],
  },
  async (console, spec, args) => {
    const [echo] = args._
    console.log(echo)
  }
)

// Activate router
router.activate()
```

## ReplServer

The REPL server provides an interactive command-line interface for system administration and
debugging.

```ts
// Starts the REPL server and begins accepting connections.
await replServer.start()

// Stops the REPL server and closes all active connections.
await replServer.stop()
```
