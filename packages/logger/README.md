# @famir/logger

[![npm version](https://img.shields.io/npm/v/@famir/logger.svg)](https://www.npmjs.com/package/@famir/logger)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Pino-based logger service for the **Famir** platform.

This package provides a shared logging layer built on top of **Pino** library.

## Purpose

- Named application logs.
- Structured logging.
- Optional custom transport support.

## Structure

The package is structured as:

- `src/logger.ts` — Common types and definitions.
- `src/logger.schemas.ts` — Various validation schemas.
- `src/pino-logger.ts` — Pino-based logger implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `Logger` via `LOGGER` token

## Installation

```sh
npm install @famir/logger
```

## Configuration

Expects the following configuration variables:

- `LOGGER_LOG_LEVEL` - logging level for the application, default: `info`

Available `LOGGER_LOG_LEVEL` values: `trace`, `debug`, `info`, `warn`, `error` and `fatal`.

Example:

```sh
LOGGER_LOG_LEVEL="debug"
```

### Settings

The logger also supports runtime settings:

- `appName` - application name to be used, default: `unknown`

Example:

```ts
{
  appName: 'console',
}
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'
import { PinoLogger } from '@famir/logger'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container, { appName: 'console' })
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { LOGGER, Logger } from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependency:
const logger = container.resolve<Logger>(LOGGER)
```

## Log messages

Example:

```ts
import { serializeError } from '@famir/common'

logger.debug('Application started')

logger.info('Session created', {
  data: {
    id: 'client-a3a7',
    lastIp: '127.0.0.1',
    secret: 'fd2c0acd',
  },
})

const error = new Error(`Database not connected`)

logger.error('Failed to start application', {
  error: serializeError(error),
})
```

## Custom transport

The logger supports an optional custom transport implementation via `LOGGER_TRANSPORT` token.

This is useful when you want to send logs to a custom stream or backend. The default behavior is to
use the standard Pino output.

Example:

```ts
import { LOGGER_TRANSPORT, LoggerTransport } from '@famir/logger'

const loggerTransport = PinoLogger.createTransport({
  target: 'pino-roll',
  options: { ... },
})

container.registerSingleton<LoggerTransport>(LOGGER_TRANSPORT, () => loggerTransport)
```
