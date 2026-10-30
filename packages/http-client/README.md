# @famir/http-client

[![npm version](https://img.shields.io/npm/v/@famir/http-client.svg)](https://www.npmjs.com/package/@famir/http-client)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Curl-based HTTP client for the **Famir** platform.

This package provides a shared HTTP client abstraction built around **node-libcurl** library. It
supports simple HTTP request, streaming request and streaming response methods.

## Purpose

- Adapted for the reverse-proxy pipeline.
- Curl-impersonate friendly.
- Configurable connection and total timeout.
- Header and body size limits.
- Result-based error handling instead of exceptions.

## Structure

The package is structured as:

- `src/http-client.ts` — Common types and definitions.
- `src/curl-http-client.ts` — Curl-based HTTP client implementation.
- `src/index.ts` - Package public exports.

And exposes the following dependencies:

- `HttpClient` via `HTTP_CLIENT` token

## Installation

```sh
# sudo apt-get install python3 libcurl4-openssl-dev build-essential

npm install @famir/http-client

# If you want to build with curl-impersonate that is installed under /opt/curl
npm rebuild node-libcurl \
  --build-from-source \
  --curl-include-dirs="/opt/curl/include" \
  --curl-libraries="-L/opt/curl/lib -lcurl-impersonate"
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'
import { PinoLogger } from '@famir/logger'
import { CurlHttpClient } from '@famir/http-client'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
CurlHttpClient.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { HttpClient, HTTP_CLIENT } from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependency:
const httpClient = container.resolve<HttpClient>(HTTP_CLIENT)
```

## Error handling

The client does not throw a regular Error for request failures. Instead, each request returns a
result object with a error field.

```ts
if (result.error) {
  console.error(result.error)
} else {
  // continue result processing
}
```

## Simple request

Performs a simple HTTP request and returns a simple response.

Both the request body and response body are fully loaded into memory. Suitable for small to
medium-sized payloads.

```ts
const result = await httpClient.simple(
  'http://localhost:8080', // proxy
  'GET', // method
  'https://example.com', // url
  { Accept: 'text/plain' }, // requestHeaders
  Buffer.alloc(0), // requestBody
  3 * 1000, // connectTimeout
  10 * 1000, // timeout
  10 * 1024, // headersSizeLimit
  1024 * 1024 // bodySizeLimit
)

if (result.error) {
  console.error(result.error) // `HttpClientError`
} else {
  // `HttpClientSimpleResult`
  console.log(result.status)
  console.log(result.responseHeaders)
  console.log(result.responseBody.toString())
}
```

## Streaming request

Performs a streaming HTTP request and returns a simple response.

The request body is streamed from a readable stream, allowing large uploads. The response body is
fully loaded into memory.

```ts
import { Readable } from 'node:stream'

const result = await httpClient.streamRequest(
  'http://localhost:8080', // proxy
  'POST', // method
  'https://example.com/upload', // url
  { 'Content-Type': 'text/plain' }, // requestHeaders
  Readable.from(['hello', 'world']), // requestBody
  3 * 1000, // connectTimeout
  60 * 1000, // timeout
  10 * 1024, // headersSizeLimit
  1024 * 1024 // bodySizeLimit
)

if (result.error) {
  console.error(result.error) // `HttpClientError`
} else {
  // `HttpClientSimpleResult`
  console.log(result.status)
  console.log(result.responseHeaders)
}
```

## Streaming response

Performs a simple HTTP request and returns a streaming response.

The request body is fully loaded into memory, but the response is streamed, allowing large downloads
to be processed incrementally.

```ts
const result = await httpClient.streamResponse(
  'http://localhost:8080', // proxy
  'GET', // method
  'https://example.com/file', // URL
  { Accept: 'application/octet-stream' }, // requestHeaders
  Buffer.alloc(0), // requestBody
  3 * 1000, // connectTimeout
  60 * 1000, // timeout
  10 * 1024 // headersSizeLimit
)

if (result.error) {
  console.error(result.error) // `HttpClientError`
} else {
  // `HttpClientStreamResult`
  console.log(result.status)
  console.log(result.responseHeaders)

  result.responseStream.on('data', (chunk) => {
    console.log(chunk)
  })
}
```
