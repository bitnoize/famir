# @famir/consumer

[![npm version](https://img.shields.io/npm/v/@famir/consumer.svg)](https://www.npmjs.com/package/@famir/consumer)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

BullMQ-backed consumer service for the **Famir** platform.

This package provides a shared background job worker layer built on top of **BullMQ** library.

## Purpose

- BullMQ-based worker execution.
- Redis connection abstraction.
- Schema-based validation before processing.
- Reusable processor router.
- Dedicated workers via modules.
- Configurable concurrency and limiter settings.

## Structure

The package is structured as:

- `src/consumer.ts` — Common types and definitions.
- `src/consumer.schemas.ts` — Various validation schema.
- `src/consumer-assets.ts` — Static assets registry.
- `src/consumer-processor.ts` — Validation and execution wrapper for a job processor.
- `src/consumer-router.ts` — Processor registration and lookup.
- `src/redis-consumer-connector.ts` — Redis connection abstraction
- `src/index.ts` - Package public exports.
- `src/modules/*` — Domain-specific worker implementations.

And exposes the following dependencies:

- `ConsumerConnector` via `CONSUMER_CONNECTOR` token
- `AnalyzeWorker` via `ANALYZE_WORKER` token
- `WebhookWorker` via `WEBHOOK_WORKER` token

## Installation

```sh
npm install @famir/consumer
```

## Configuration

Expects the following configuration variables:

- `CONSUMER_CONNECTION_URL` - Redis connection string, default: `redis://127.0.0.1:6379/1`
- `CONSUMER_PREFIX` - Global prefix for all Redis keys, default: `bull`

Example:

```sh
CONSUMER_CONNECTION_URL="redis://:strongpass@127.0.0.1:6379/1"
CONSUMER_PREFIX="bull"
```

### Settings

The worker also supports runtime settings:

- `concurrency` — Maximum number of jobs processed concurrently, default: `2`
- `limiterMax` — Max number of jobs in the rate limiter window, default: `1`
- `limiterDuration` — Duration of the limiter window in milliseconds, default: `1000`

Example:

```ts
{
  concurrency: 10,
  limiterMax: 10,
  limiterDuration: 1000
}
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
  ConsumerAssets,
  ConsumerRouter,
  RedisConsumerConnector,
  BullAnalyzeWorker,
  BullWebhookWorker,
} from '@famir/consumer'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Define your assets:
const assets: [string, string][] = [['hello.txt', `Hi, there!`]]

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
EtaTemplater.register(container)
ConsumerAssets.register(container, assets)
ConsumerRouter.register(container)
RedisConsumerConnector.register(container)

// Register workers:
BullAnalyzeWorker.register(container)
BullWebhookWorker.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import {
  ConsumerConnector,
  CONSUMER_CONNECTOR,
  AnalyzeWorker,
  ANALYZE_WORKER,
  WebhookWorker,
  WEBHOOK_WORKER,
} from '@famir/domain'
import {
  type ConsumerAssets,
  CONSUMER_ASSETS,
  type ConsumerRouter,
  CONSUMER_ROUTER,
} from '@famir/http-server'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependencies:
const assets = container.resolve<ConsumerAssets>(CONSUMER_ASSETS)
const router = container.resolve<ConsumerRouter>(CONSUMER_ROUTER)
const connector = container.resolve<ConsumerConnector>(CONSUMER_CONNECTOR)

// Resolve workers:
const analyzeWorker = container.resolve<AnalyzeWorker>(ANALYZE_WORKER)
const webhookWorker = container.resolve<WebhookWorker>(WEBHOOK_WORKER)
```

## ConsumerAssets

The assets is a collection of static text files that are added during the application build process.

```ts
const text = assets.get('hello.txt')
console.log(text) // 'Hi, there!'
```

## ConsumerRouter

The router acts as root of a consumer and handles the routing jobs to their respective processors.

```ts
import { ANALYZE_QUEUE_NAME, AnalyzeJobData } from '@famir/domain'
import { analyzeJobDataSchema } from '@famir/consumer'

// Add schema to validator
this.validator.addSchema('analyze-job-data', analyzeJobDataSchema)

// Add custom command
router.addQueue(ANALYZE_QUEUE_NAME).addProcessor<AnalyzeJobData>(
  {
    queueName: ANALYZE_QUEUE_NAME,
    jobName: 'default',
    schemaName: 'analyze-job-data',
  },
  async (spec, data) => {
    console.log(data) // `AnalyzeJobData`
  }
)

// Activate router
router.activate()
```

## ConsumerConnector

The connector is responsible for establishing and managing the lifecycle of the consumer connection.

```ts
import { RedisConsumerConnection } from '@famir/consumer'

// Establishes a connection to the consumer.
await connector.connect()

// Retrieves the underlying consumer connection.
await connector.connect()

// Gracefully closes a connection to the consumer.
await connector.close()
```

## Analyze module

### AnalyzeWorker

Example:

```ts
// Starts the worker, enabling it to process jobs.
await analyzeWorker.run()

// Gracefully closes the worker.
await analyzeWorker.close()
```

## Webhook module

### WebhookWorker

Example:

```ts
// Starts the worker, enabling it to process jobs.
await webhookWorker.run()

// Gracefully closes the worker.
await webhookWorker.close()
```
