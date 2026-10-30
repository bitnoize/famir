# @famir/config

[![npm version](https://img.shields.io/npm/v/@famir/config.svg)](https://www.npmjs.com/package/@famir/config)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Environment-based config service for the **Famir** platform.

This package provides a shared configuration layer for all other packages in the monorepo.

## Purpose

- Read configuration from environment variables.
- Validate config against JSON Schema.
- Cache validated config objects by schema name.

## Structure

The package is structured as:

- `src/env-config.ts` - Environment-based config implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `Config` via `CONFIG` token

## Installation

```sh
npm install @famir/config
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { VALIDATOR, Validator, CONFIG, Config } from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependencies:
const validator = container.resolve<Validator>(VALIDATOR)
const config = container.resolve<Config>(CONFIG)
```

## Define schema

Define interface and JSON Schema for configuration to validate:

```ts
import { JSONSchemaType } from '@famir/common'
import { ConfigData } from '@famir/domain'

// Your configuration interface:
interface ServerConfig extends ConfigData {
  PORT: number
  SECRET: string
}

// Your configuration schema:
const serverConfigSchema: JSONSchemaType<ServerConfig> = {
  type: 'object',
  required: ['PORT', 'SECRET'],
  properties: {
    PORT: { type: 'number', minimum: 1, default: 3000 },
    SECRET: { type: 'string', minLength: 8 },
  },
  additionalProperties: false,
} as const

// Add schema to the validator.
validator.addSchema('server-config', serverConfigSchema)
```

## Read config

Example:

```ts
// Get parsed and validated configuration object.
const conf = config.get<ServerConfig>('server-config')
console.log(conf) // `ServerConfig`
```

## Notes

- Environment variables are read from the process at startup.
- Use strict schemas and explicit env names.
