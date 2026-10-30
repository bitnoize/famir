# @famir/templater

[![npm version](https://img.shields.io/npm/v/@famir/templater.svg)](https://www.npmjs.com/package/@famir/templater)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Eta-based template rendering service for the **Famir** platform.

This package provides a shared rendering layer built on top of the Eta template engine.

## Purpose

- Render templates from strings.
- Pass structured data into templates.

## Structure

The package is structured as:

- `src/eta-templater.ts` — Eta-based templater implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `Templater` via `TEMPLATER` token

## Installation

```sh
npm install @famir/templater
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { EtaTemplater } from '@famir/templater'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependency:
EtaTemplater.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { TEMPLATER, Templater } from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependency:
const templater = container.resolve<Templater>(TEMPLATER)
```

## Render template

Example:

```ts
// Renders a template string with the provided data.
const text = templater.render('Hello <%= data.name %>!', {
  name: 'world',
})
console.log(text) // 'Hello world!'
```
