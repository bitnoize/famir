# @famir/domain

[![npm version](https://img.shields.io/npm/v/@famir/domain.svg)](https://www.npmjs.com/package/@famir/domain)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Shared domain contracts for the **Famir** platform.

This package defines the core interfaces, types, and protocol contracts used across the monorepo. It
is intentionally framework and infrastructure-agnostic: concrete implementations live in other
packages.

## Structure

The package is structured as:

- `src/domain.error.ts` — Common domain-level error abstraction.
- `src/http-proto.ts` — HTTP protocol primitives and shared types.
- `src/index.ts` - Package public exports.
- `src/queues/*` — Job representations and queue/worker contracts.
- `src/repositories/*` — Model representations and repository contracts.
- `src/services/*` — Infrastructure service contracts.

## Design principles

- Keep the domain layer free from runtime infrastructure.
- Define reusable contracts, not implementations.
- Prefer explicit interfaces over ad-hoc shapes.
- Keep cross-package boundaries stable.
