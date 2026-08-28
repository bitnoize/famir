# Famir

[![Build and Deploy](https://github.com/bitnoize/famir/actions/workflows/main.yml/badge.svg)](https://github.com/bitnoize/famir/actions/workflows/main.yml)

An extensible ecosystem for creating website mirrors using reverse proxying.

## Applications

- **reverse-app** - Multi-tenant reverse proxy with dynamic configuration.
- **console-app** - Command interface for managing mirrors.
- **actions-app** - Workers for background queue processing.

## Key features

- Clean, modular architecture.
- Tracking users through session cookies.
- Cloaking mirrors via personalized landing pages with bot protection.
- Bypass any of TLS fingerprint checks from site-donor.
- Outgoing traffic to site-donors via pool of HTTP or SOCKS proxies.
- Integration with Caddy admin API for simple deployment.
- Resistant to errors, follows HTTP standards.
- Minimum third-party dependencies.

## Technology stack

- **Runtime:** Node.js (TypeScript)
- **Database:** Redis
- **Storage:** S3‑compatible storage
- **Edge server:** Caddy

## Disclaimer

> This tool is intended **only for educational purposes** and legitimate security research.
> The author assumes no responsibility for misuse.

## Links

- [Website](https://fake-mirrors.net/)
- [Documentation](https://docs.fake-mirrors.net/)
- [Demo project](https://github.com/bitnoize/famir-demo#readme)
