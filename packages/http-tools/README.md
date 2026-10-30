# @famir/http-tools

[![npm version](https://img.shields.io/npm/v/@famir/http-tools.svg)](https://www.npmjs.com/package/@famir/http-tools)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

HTTP protocol helpers for the **Famir** platform.

This package provides reusable HTTP primitives and wrappers used throughout the monorepo. It
contains the core building blocks for parsing, transforming, normalizing, and inspecting HTTP
requests and responses, especially in reverse-proxy and message-processing flows.

## Structure

The package is structured as:

- `src/message.ts` — HTTP message object for request/response orchestration.
- `src/method.ts` — HTTP method wrapper for validation and normalization.
- `src/url.ts` — HTTP URL wrapper for parsing and rewriting.
- `src/status.ts` — HTTP status wrapper.
- `src/headers.ts` — HTTP headers wrapper for normalization and mutation.
- `src/body.ts` — HTTP body wrapper for binary/text/JSON/query-string payload handling.
- `src/transforms.ts` — Stream transform utilities.
- `src/content-type.ts` — Content-type parsing/formatting helpers.
- `src/query-string.ts` — Query-string parsing/formatting helpers.
- `src/cookies.ts` — Cookie parsing/formatting helpers.
- `src/rewrite-url.ts` — Donor/mirror URL rewrite logic.
- `src/bowser.ts` — User-agent parsing helpers.
- `src/cheerio.ts` — HTML parsing utilities.
- `src/isbot.ts` — Bot detection helpers.
- `src/schemas.ts` — Shared HTTP validation schemas.

## Installation

```sh
npm install @famir/http-tools
```

## Message

The `HttpMessage` is the central object used to represent a full HTTP message. It acts as a single
object that can be built, transformed, and finalized during reverse-proxy processing.

```ts
import { HttpMessage } from '@famir/http-tools'

// Create a new message
const message = HttpMessage.create('normal')

// Set request
message.method.set('GET')
message.url.setRelative('/hello')
message.requestHeaders.set('Host', 'example.com')
message.requestBody.setText('hello')

// Set response
message.status.set(200)
message.responseHeaders.set('Content-Type', 'text/plain; charset=utf-8')
message.responseBody.setText('ok')

// Finalize
message.ready()
```

## Method wrapper

Example:

```ts
import { HttpMethodWrap } from '@famir/http-tools'

const method = HttpMethodWrap.fromString('POST')
console.log(method.get())
```

## URL wrapper

Example:

```ts
import { HttpUrlWrap } from '@famir/http-tools'

const url = HttpUrlWrap.fromRelative('/docs?page=1')
console.log(url.toRelative())
```

## Status wrapper

Example:

```ts
import { HttpStatusWrap } from '@famir/http-tools'

const status = HttpStatusWrap.fromScratch()
status.set(404)
console.log(status.isClientError())
```

## Headers wrapper

Example:

```ts
import { HttpHeadersWrap } from '@famir/http-tools'

const headers = HttpHeadersWrap.fromScratch()
headers.set('X-Test', '1')
headers.set('X-Test', ['a', 'b'])
```

## Body wrapper

Example:

```ts
import { HttpBodyWrap } from '@famir/http-tools'

const body = HttpBodyWrap.fromScratch()
body.setText('hello world')
console.log(body.getText())
```

## JSON Schema helpers

Provides reusable JSON Schema fragments:

- `httpTypeSchema` - Validate an HTTP type.
- `httpMethodSchema` - Validate an HTTP method.
- `httpRelativeUrlSchema` - Validate a relative URL.
- `httpStatusSchema` - Validate an HTTP response status.
- `httpHeaderSchema` - Validate a single HTTP header.
- `httpHeadersSchema` - Validate an HTTP headers object.
- `httpConnectionSchema` - Validate connection details.
- `httpPayloadSchema` - Validate payload data.
- `httpErrorSchema` - Validate a single processing error.
- `httpErrorsSchema` - Validate a list of processing errors.
