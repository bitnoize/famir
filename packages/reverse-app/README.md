# @famir/reverse-app

[![npm version](https://img.shields.io/npm/v/@famir/reverse-app.svg)](https://www.npmjs.com/package/@famir/reverse-app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Multi-tenant reverse proxy with dynamic configuration.

## Features

- Extensible application with a set of controllers and services.
- Brings together all dependencies through a DI container.
- Simple loader with external composition root to start/stop app.

## Modules

The package is divided into modules, which consist of **controller** and optional **service**.

### Setup mirror

Dynamic mirror configuration from campaign.

### Well known URLs

Handle static resources like /favicon.ico or /robots.txt.

### Authorize

User tracking via session cookies and cloaking mirror.

### Transform

Configure message streams transformations.

### Forward

Forwarding the message to the donor site.

### Complete

Saves the message in the database for later analysis.
