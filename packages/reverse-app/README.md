# @famir/reverse-app

[![npm version](https://img.shields.io/npm/v/@famir/reverse-app.svg)](https://www.npmjs.com/package/@famir/reverse-app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Reverse proxy application for the **Famir** platform.

## Structure

The package is structured as:

- `src/loader.ts` — Bootstrap all infrastructure modules and starts/stops the application.
- `src/reverse-app.ts` — Top-level runtime orchestrator for the application.
- `src/index.ts` - Package public exports.
- `src/modules/*` — Domain-specific controllers and services.

And exposes the following dependencies:

- `ReverseApp` via `REVERSE_APP` token
- `SetupMirrorController` via `SETUP_MIRROR_CONTROLLER` token
- `SetupMirrorService` via `SETUP_MIRROR_SERVICE` token
- `WellKnownUrlsController` via `WELL_KNOWN_URLS_CONTROLLER` token
- `AuthorizeController` via `AUTHORIZE_CONTROLLER` token
- `AuthorizeService` via `AUTHORIZE_SERVICE` token
- `TransformController` via `TRANSFORM_CONTROLLER` token
- `ForwardController` via `FORWARD_CONTROLLER` token
- `ForwardService` via `FORWARD_SERVICE` token
- `CompleteController` via `COMPLETE_CONTROLLER` token
- `CompleteService` via `COMPLETE_SERVICE` token

## Installation

```sh
npm install @famir/reverse-app
```
