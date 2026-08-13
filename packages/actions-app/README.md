# @famir/actions-app

[![npm version](https://img.shields.io/npm/v/@famir/actions-app.svg)](https://www.npmjs.com/package/@famir/actions-app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Workers for background job processing.

## Features

- Extensible application with a set of controllers and services.
- Brings together all dependencies through a DI container.
- Simple loader with external composition root to start/stop app.

## Modules

The package is divided into modules, which consist of **controller** and optional **service**.

### Analyze

Processing catched HTTP messages from reverse-proxy.
