# @famir/console-app

[![npm version](https://img.shields.io/npm/v/@famir/console-app.svg)](https://www.npmjs.com/package/@famir/console-app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Command interface for managing infrastructure.

## Features

- Extensible application with a set of controllers and services.
- Brings together all dependencies through a DI container.
- Simple loader with external composition root to start/stop app.

## Modules

The package is divided into modules, which consist of **controller** and optional **service**.

### Campaign, Proxy, Target, Redirector, Lure, Session, Message

Definitions for create-read-update-delete-list commands for dynamic configuration management.

### System

Other system commands.
