# Fake Mirrors

[![Build and Deploy](https://github.com/bitnoize/famir/actions/workflows/main.yml/badge.svg)](https://github.com/bitnoize/famir/actions/workflows/main.yml)

An extensible platform for creating and manage website mirrors using reverse proxying.

## Stack

- **Runtime:** Node.js (TypeScript)
- **Database:** Redis
- **Storage:** S3‑compatible storage
- **Edge server:** Caddy, Nginx

## Packages

This monorepo contains the following packages:

- `@famir/domain`
- `@famir/common`
- `@famir/validator`
- `@famir/config`
- `@famir/logger`
- `@famir/templater`
- `@famir/database`
- `@famir/storage`
- `@famir/producer`
- `@famir/consumer`
- `@famir/http-client`
- `@famir/http-server`
- `@famir/http-tools`
- `@famir/repl-server`
- `@famir/console-app`
- `@famir/reverse-app`
- `@famir/actions-app`

## Example

A fully functional demonstration project:
[famir-demo](https://github.com/bitnoize/famir-demo#readme)

## Links

- [Website](https://fake-mirrors.net/)
- [API Docs](https://docs.fake-mirrors.net/)
- [NPM Org](https://www.npmjs.com/org/famir)

## Disclaimer

> This software is intended only for educational purposes and legitimate security research. The
> author assumes no responsibility for misuse.
