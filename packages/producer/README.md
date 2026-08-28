# @famir/producer

[![npm version](https://img.shields.io/npm/v/@famir/producer.svg)](https://www.npmjs.com/package/@famir/producer)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Background job queues service.

## Features

- Fast and robust queue **BullMQ** backend.
- Clear error handling with `ProducerError`.
- Integrated with other packages of the ecosystem.

## Modules

The package is divided into modules, which consist of **contract**,  **queue** and **job**.

### Analyze

Processing catched HTTP messages from reverse-proxy.

### Webhook

Pending outgoing requests on behalf of the client.
