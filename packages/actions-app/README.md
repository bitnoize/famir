# @famir/actions-app

[![npm version](https://img.shields.io/npm/v/@famir/actions-app.svg)](https://www.npmjs.com/package/@famir/actions-app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Actions application for the **Famir** platform.

## Structure

The package is structured as:

- `src/loader.ts` — Bootstrap all infrastructure modules and starts/stops the application.
- `src/actions-app.ts` — Top-level runtime orchestrator for the application.
- `src/index.ts` - Package public exports.
- `src/modules/*` — Domain-specific controllers and services.

And exposes the following dependencies:

- `ActionsApp` via `ACTIONS_APP` token
- `AnalyzeController` via `ANALYZE_CONTROLLER` token
- `AnalyzeService` via `ANALYZE_SERVICE` token

## Installation

```sh
npm install @famir/actions-app
```
