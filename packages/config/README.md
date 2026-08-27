# @famir/config

[![npm version](https://img.shields.io/npm/v/@famir/config.svg)](https://www.npmjs.com/package/@famir/config)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Load and validate configuration

## Features

- TypeScript-first with strict type guards and assertions
- Validates config using `@famir/validator` package
- Universal way via environment variables
- Parses config only on first use (lazy loading)
- Caches the result for better performance
- Integration with `@famir/common` DI container
