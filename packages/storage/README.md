# @famir/storage

[![npm version](https://img.shields.io/npm/v/@famir/storage.svg)](https://www.npmjs.com/package/@famir/storage)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

MinIO-based object storage service for the **Famir** platform.

This package provides an S3-compatible object storage layer built on top of the **MinIO** client.

## Purpose

- Object storage client initialization.
- Bucket existence validation.
- Methods for upload, download and delete files from storage.

## Structure

The package is structured as:

- `src/storage.ts` - Common types and definitions.
- `src/storage.schemas.ts` - Various validation schemas.
- `src/minio-storage.ts` - MinIO-based storage implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `Storage` via `STORAGE` token

## Installation

```sh
npm install @famir/storage
```

## Configuration

Expects the following configuration variables:

- `STORAGE_ENDPOINT` - Server endpoint, default: `localhost`
- `STORAGE_PORT` - Server port, default: `9000`
- `STORAGE_USE_SSL` - Whether to use SSL for the connection, default: `false`
- `STORAGE_ACCESS_KEY` - Access key (username)
- `STORAGE_SECRET_KEY` - Secret key (password)
- `STORAGE_BUCKET_NAME` - Name of the bucket to use, default: `famir`

Example:

```sh
STORAGE_ENDPOINT="localhost"
STORAGE_PORT="9000"
STORAGE_USE_SSL="false"
STORAGE_ACCESS_KEY="admin"
STORAGE_SECRET_KEY="strongpass"
STORAGE_BUCKET_NAME="famir"
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'
import { PinoLogger } from '@famir/logger'
import { MinioStorage } from '@famir/storage'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
MinioStorage.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { STORAGE, Storage } from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependency:
const storage = container.resolve<Storage>(STORAGE)
```

## Interacting with storage

Provides methods for basic S3-compatible storage operations:

```ts
// Checks that the configured bucket exists.
await storage.checkBucketExists()

// Stores an object in the storage.
await storage.putObject('test.txt', Buffer.from('Hello'), {
  'Content-Type': 'text/plain',
})

// Retrieves an object from the storage.
const data = await storage.getObject('test.txt')
console.log(data.toString()) // 'Hello'

// Deletes an object from the storage.
await storage.deleteObject('test.txt')
```
