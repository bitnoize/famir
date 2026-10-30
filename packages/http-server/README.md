# @famir/http-server

[![npm version](https://img.shields.io/npm/v/@famir/http-server.svg)](https://www.npmjs.com/package/@famir/http-server)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Native HTTP server for the **Famir** platform.

This package provides a shared HTTP server abstraction built around **node:http** and **ws**
libraries. It supports normal HTTP requests, WebSocket upgrades, a modular middleware chain with a
shared request context abstraction, and reusable server assets.

## Purpose

- Adapted for the reverse-proxy pipeline.
- Reusable router with middleware pipeline.
- WebSocket support.
- Request context abstraction.
- Assets with default server error page.

## Structure

The package is structured as:

- `src/http-server.ts` - Common types and definitions.
- `src/http-server.schemas.ts` - Various validation schema.
- `src/http-server-assets.ts` - Static assets registry.
- `src/http-server-context-factory.ts` - Context creation for normal and websocket requests.
- `src/http-server-context.ts` - Context abstractions for normal and websocket requests.
- `src/http-server-middleware.ts` - Middleware contract.
- `src/http-server-router.ts` - Router with middleware chain registration.
- `src/native-http-server.ts` - Native HTTP server implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `HttpServer` via `HTTP_SERVER` token
- `HttpServerAssets` via `HTTP_SERVER_ASSETS` token
- `HttpServerRouter` via `HTTP_SERVER_ROUTER` token
- `HttpServerContextFactory` via `HTTP_SERVER_CONTEXT_FACTORY` token

## Installation

```sh
npm install @famir/http-server
```

## Configuration

Expects the following configuration variables:

- `HTTP_SERVER_ADDRESS` - listening address, default: `127.0.0.1`
- `HTTP_SERVER_PORT` - listening port, default: `3000`

Example:

```sh
HTTP_SERVER_ADDRESS="127.0.0.1"
HTTP_SERVER_PORT="3000"
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
  HttpServerAssets,
  HttpServerRouter,
  HttpServerContextFactory,
  NativeHttpServer,
} from '@famir/http-server'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Define your assets:
const assets: [string, string][] = [['hello.txt', `Hi, there!`]]

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
EtaTemplater.register(container)
HttpServerAssets.register(container, assets)
HttpServerRouter.register(container)
HttpServerContextFactory.register(container)
NativeHttpServer.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { HttpServer, HTTP_SERVER } from '@famir/domain'
import {
  type HttpServerAssets,
  HTTP_SERVER_ASSETS,
  type HttpServerRouter,
  HTTP_SERVER_ROUTER,
  type HttpServerContextFactory,
  HTTP_SERVER_CONTEXT_FACTORY,
} from '@famir/http-server'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependencies:
const assets = container.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
const router = container.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
const contextFactory = container.resolve<HttpServerContextFactory>(HTTP_SERVER_CONTEXT_FACTORY)
const httpServer = container.resolve<HttpServer>(HTTP_SERVER)
```

## HttpServerAssets

The assets is a collection of static text files that are added during the application build process.

```ts
const text = assets.get('hello.txt')
console.log(text) // 'Hi, there!'
```

## HttpServerRouter

The router acts as root of HTTP server and handles the routing of requests through a middleware
chain.

```ts
// Add middleware
router.addMiddleware('test', async (ctx, next) => {
  // Send simple response
  ctx.status(200)
  ctx.responseBody.setText('Hello')

  await ctx.sendResponse()

  // Goto next middleware
  await next()
})

// Activate router
router.activate()
```

## HttpServer

The server handles incoming HTTP requests and WebSocket connections, processes them through a chain
of middleware, and sends appropriate responses.

```ts
// Starts the server and begins accepting connections.
await httpServer.start()

// Stops the server and closes all active connections.
await httpServer.stop()
```
