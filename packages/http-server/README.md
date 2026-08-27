# @famir/http-server

[![npm version](https://img.shields.io/npm/v/@famir/http-server.svg)](https://www.npmjs.com/package/@famir/http-server)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Robust HTTP server with middleware support

## Features

- TypeScript-first with strict type guards and assertions
- Configuration via `@famir/config` package
- Native **node:http** as backend HTTP Server
- WebSocket support via `ws` package
- A context with the HTTP data during the lifetime of the request
- Clear error handling with `HttpServerError`
- Integration with `@famir/common` DI container
