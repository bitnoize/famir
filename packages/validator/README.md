# @famir/validator

[![npm version](https://img.shields.io/npm/v/@famir/validator.svg)](https://www.npmjs.com/package/@famir/validator)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Ajv-based validator service for the **Famir** platform.

This package provides a shared JSON Schema validation layer built on top of **Ajv** library.

## Purpose

- JSON Schema registration by name.
- Type-safe runtime guard validation.
- Type-safe runtime assert validation.
- Rich Ajv error reporting.
- Shared schema usage across packages.

## Structure

The package is structured as:

- `src/ajv-validator.ts` - Ajv-based validator implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `Validator` via `VALIDATOR` token

## Installation

```sh
npm install @famir/validator
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependency:
AjvValidator.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { VALIDATOR, Validator } from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependency:
const validator = container.resolve<Validator>(VALIDATOR)
```

## Validation behavior

The underlying Ajv instance is configured with:

- Defaults may be injected into data.
- Values may be coerced to expected types.
- Additional fields may be removed.
- Some invalid shapes may be rejected strictly.

This behavior should be considered when building schemas and validating user input.

## Define schema

Define interface and JSON Schema for object to validate:

```ts
import { JSONSchemaType } from '@famir/common'

// Your user interface:
interface User {
  name: string
  age: number
}

// Your user schema:
const userSchema: JSONSchemaType<User> = {
  type: 'object',
  required: ['name', 'age'],
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
} as const

// Add schema to the validator.
validator.addSchema('user', userSchema)
```

## Guard validation

Example:

```ts
// Any data to validate
const data: unknown = { name: 'Alice', age: 30 }

// Type-safe guard validation
if (validator.guardSchema<User>('user', data)) {
  // TypeScript knows this is User
  console.log(data.name)
  console.log(data.age)
} else {
  console.error('Invalid user data')
}
```

## Assert validation

Example:

```ts
// Any data to validate
const data: unknown = { name: 'Bob', age: 25 }

// Type-safe assert validation with exception filter
try {
  validator.assertSchema<User>('user', data)

  // TypeScript knows this is User
  console.log(data.name)
  console.log(data.age)
} catch (error) {
  if (error instanceof ValidatorError) {
    console.warn(error.validateErrors)
  } else {
    console.error(error)
  }
}
```

## Notes

- Schema names must be unique within the validator.
- Register schemas once during application setup.
- Prefer explicit, strict schemas for runtime data validation.
