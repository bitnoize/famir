# @famir/common

[![npm version](https://img.shields.io/npm/v/@famir/common.svg)](https://www.npmjs.com/package/@famir/common)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Common utilities for the **Famir** platform.

This package provides a shared utility layer contains agnostic helpers used across the monorepo.

## Structure

The package is structured as:

- `src/di.ts` - Dependency Injection container.
- `src/base64.ts` - URL-safe Base64 encoding/decoding.
- `src/crypt.ts` - Cryptographic helpers.
- `src/random.ts` - Random generation helpers.
- `src/schemas.ts` - JSON Schema helpers.
- `src/array-includes.ts` - A type-safe wrapper for `Array.includes()`.
- `src/serialize-error.ts` - Serialization for error.
- `src/index.ts` - Package public exports.

## Installation

```sh
npm install @famir/common
```

## Dependency Injection

A lightweight Dependency Injection container.

Supports registering dependencies as singletons or transients and includes built-in detection for
circular dependencies.

```ts
import { DIContainer } from '@famir/common'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Config object
interface Config {
  level: string
}

// Logger service
class Logger {
  constructor(protected readonly config: Config) {}
  // ...
}

// Registers the config as a singleton in the DI container.
container.registerSingleton<Config>('config', () => ({ level: 'warn' }))

// Registers the logger as a transient in the DI container.
container.registerTransient<Logger>('logger', (c) => new Logger(c.resolve('config')))

// Resolve dependencies:
const config = container.resolve<Config>('config')
const logger = container.resolve<Logger>('logger')
```

## Base64 helpers

Useful for URL-safe Base64 encoding/decoding:

```ts
import { safeBase64Encode, safeBase64Decode } from '@famir/common'

// Encodes a Buffer into a URL-safe Base64 string.
const encoded = safeBase64Encode(Buffer.from('Hello world'))

// Decodes a URL-safe Base64 string back into a Buffer.
const decoded = safeBase64Decode(encoded).toString()
```

## Cryptographic helpers

Useful for symmetric encryption/decryption:

```ts
import { encrypt, decrypt } from '@famir/common'

// Encrypts a plaintext string using AES-256-GCM.
const encrypted = encrypt('Hello world', 'strongpass')

// Decrypts a URL-safe Base64 encoded ciphertext using AES-256-GCM.
const decrypted = decrypt(encrypted, 'strongpass')
```

## Random helpers

Useful for generating random IDs and temporary names:

```ts
import { randomIdent, randomName } from '@famir/common'

// Generates a cryptographically secure random identifier.
const id = randomIdent() // string like `a5312dbd47a1499cbd9c453fc7310eb2`

// Generates a random, human-readable name.
const label = randomName() // string like `hecovoi`
```

## JSON Schema helpers

Re-exports `JSONSchemaType` from `ajv` package and provides reusable JSON Schema fragments:

- `booleanSchema` - Validating a boolean value.
- `customIdentSchema` - Validating custom identifier.
- `randomIdentSchema` - Validating random identifier.
- `secretSchema` - Validating a secret value.
- `counterSchema` - Validating a counter number.
- `timestampSchema` - Validating a timestamp.

## Error serialization

Re-exports `serializeError` from `serialize-error` package.

```ts
import { serializeError } from '@famir/common'

console.log(serializeError(new Error('Panic!')))
```
