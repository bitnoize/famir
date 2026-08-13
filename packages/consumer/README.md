# @famir/consumer

[![npm version](https://img.shields.io/npm/v/@famir/consumer.svg)](https://www.npmjs.com/package/@famir/consumer)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Workers for background job processing.

## Features

- Fast and robust **BullMQ** backend.
- Scales horizontally across multiple servers.
- Clear error handling with `ConsumerError`.
- Integrated with other packages of the ecosystem.

## Modules

The package is divided into modules, which consist of **contract** and **worker**.

### Analyze

Processing catched HTTP messages from reverse-proxy.

### Webhook

Pending outgoing requests on behalf of the client.
