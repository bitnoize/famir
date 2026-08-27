# @famir/consumer

[![npm version](https://img.shields.io/npm/v/@famir/consumer.svg)](https://www.npmjs.com/package/@famir/consumer)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Consumer connector and background workers

## Features

- TypeScript-first with strict type guards and assertions
- Configuration via `@famir/config` package
- Fast and robust queue **BullMQ** backend
- Clear error handling with `ConsumerError`
- Integration with `@famir/common` DI container

## Modules

- **Analyze** – processing catched HTTP messages from reverse-proxy
- **Webhook** – pending outgoing requests on behalf of the client
