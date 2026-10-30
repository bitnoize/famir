# @famir/console-app

[![npm version](https://img.shields.io/npm/v/@famir/console-app.svg)](https://www.npmjs.com/package/@famir/console-app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Console application for the **Famir** platform.

## Structure

The package is structured as:

- `src/loader.ts` — Bootstrap all infrastructure modules and starts/stops the application.
- `src/console-app.ts` — Top-level runtime orchestrator for the application.
- `src/index.ts` - Package public exports.
- `src/modules/*` — Domain-specific controllers and services.

And exposes the following dependencies:

- `ConsoleApp` via `CONSOLE_APP` token
- `SystemController` via `SYSTEM_CONTROLLER` token
- `SystemService` via `SYSTEM_SERVICE` token
- `CampaignController` via `CAMPAIGN_CONTROLLER` token
- `CampaignService` via `CAMPAIGN_SERVICE` token
- `ProxyController` via `PROXY_CONTROLLER` token
- `ProxyService` via `PROXY_SERVICE` token
- `TargetController` via `TARGET_CONTROLLER` token
- `TargetService` via `TARGET_SERVICE` token
- `RedirectorController` via `REDIRECTOR_CONTROLLER` token
- `RedirectorService` via `REDIRECTOR_SERVICE` token
- `LureController` via `LURE_CONTROLLER` token
- `LureService` via `LURE_SERVICE` token
- `SessionController` via `SESSION_CONTROLLER` token
- `SessionService` via `SESSION_SERVICE` token
- `MessageController` via `MESSAGE_CONTROLLER` token
- `MessageService` via `MESSAGE_SERVICE` token

## Installation

```sh
npm install @famir/console-app
```
