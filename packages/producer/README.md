# @famir/producer

[![npm version](https://img.shields.io/npm/v/@famir/producer.svg)](https://www.npmjs.com/package/@famir/producer)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

BullMQ-backed producer service for the **Famir** platform.

This package provides a shared background job queue layer built on top of **BullMQ** library.

## Purpose

- BullMQ-based background jobs.
- Redis connection abstraction.
- Reusable queue base class.
- Dedicated queues via modules.
- Worker and job monitoring support.

## Structure

The package is structured as:

- `src/producer.ts` - Common types and definitions.
- `src/producer.schemas.ts` - Various validation schemas.
- `src/redis-producer-connector.ts` — Redis producer-connector implementation.
- `src/index.ts` - Package public exports.
- `src/modules/*` — Domain-specific queue implementations.

And exposes the following dependencies:

- `ProducerConnector` via `PRODUCER_CONNECTOR` token
- `AnalyzeQueue` via `ANALYZE_QUEUE` token
- `WebhookQueue` via `WEBHOOK_QUEUE` token

## Installation

```sh
npm install @famir/producer
```

## Configuration

Expects the following configuration variables:

- `PRODUCER_CONNECTION_URL` - Redis connection string, default: `redis://127.0.0.1:6379/1`
- `PRODUCER_PREFIX` - Global prefix for all Redis keys, default: `bull`

Example:

```sh
PRODUCER_CONNECTION_URL="redis://:strongpass@127.0.0.1:6379/1"
PRODUCER_PREFIX="bull"
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'
import { PinoLogger } from '@famir/logger'
import { RedisProducerConnector, BullAnalyzeQueue, BullWebhookQueue } from '@famir/producer'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
RedisProducerConnector.register(container)

// Register queues:
BullAnalyzeQueue.register(container)
BullWebhookQueue.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import {
  ProducerConnector,
  PRODUCER_CONNECTOR,
  AnalyzeQueue,
  ANALYZE_QUEUE,
  WebhookQueue,
  WEBHOOK_QUEUE,
} from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependencies:
const connector = container.resolve<ProducerConnector>(PRODUCER_CONNECTOR)

// Resolve queues:
const analyzeQueue = container.resolve<AnalyzeQueue>(ANALYZE_QUEUE)
const webhookQueue = container.resolve<WebhookQueue>(WEBHOOK_QUEUE)
```

## ProducerConnector

The connector is responsible for establishing and managing the lifecycle of the producer connection.

```ts
import { RedisProducerConnection } from '@famir/producer'

// Establishes a connection to the producer.
await connector.connect()

// Retrieves the underlying producer connection.
await connector.connect()

// Gracefully closes a connection to the producer.
await connector.close()
```

## Analyze module

### AnalyzeJob

Data payload for an analyze job:

```ts
import { AnalyzeJobData } from '@famir/domain'

const analyzeJobData: AnalyzeJobData = {
  campaignId: 'httpbin',
  messageId: 'f1a0ec44e4ed4f998ebc780180fe56c8',
}
```

### AnalyzeQueue

This queue is responsible for processing captured messages from a reverse-proxy and performing
analysis tasks like parsing, logging, or threat detection.

```ts
// Adds a new job to the analyze queue.
await analyzeQueue.addJob('default', analyzeJobData)

// Retrieves the total number of jobs in the queue.
const jobCount = await analyzeQueue.getJobCount() // `number`

// Retrieves the workers for the queue.
const workers = await analyzeQueue.getWorkers() // `object[]`

// Gracefully closes the queue.
await analyzeQueue.close()
```

## Webhook module

TODO
