# Fake Mirrors

[![Build and Deploy](https://github.com/bitnoize/famir/actions/workflows/main.yml/badge.svg)](https://github.com/bitnoize/famir/actions/workflows/main.yml)

An extensible ecosystem for creating and manage website mirrors using reverse proxying.

For web traffic security researchers and for overcoming the fragmentation of the once
unified internet. 😎

## Applications

- **reverse-app** - Multi-target reverse proxy with dynamic configuration.
- **console-app** - Command interface for managing infrastructure.
- **actions-app** - Workers for background job processing.

## Key features

- Clean, modular architecture.
- Extensive capabilities for intercepting and modifying proxied messages.
- Tracking users through session cookies with bot protection.
- Cloaking mirrors via customized well known resources and personalized landing pages.
- Bypass any of TLS fingerprint checks from site-donor.
- Outgoing traffic to site-donors via pool of HTTP or SOCKS proxies.
- Background post-processing of captured data.
- Integration with Caddy admin API for simple deployment.
- Fast, capable of handling dozens of campaigns on a single low-cost virtual server.
- Resistant to errors, follows HTTP standards.

## Technology stack

- **Runtime:** Node.js (TypeScript)
- **Database:** Redis
- **Storage:** S3‑compatible storage
- **Edge server:** Caddy

## Disclaimer

> This tool is intended only for educational purposes and legitimate security research.
> The author assumes no responsibility for misuse.

## Links

- [Website](https://fake-mirrors.net/)
- [Documentation](https://docs.fake-mirrors.net/)
- [Demo project](https://github.com/bitnoize/famir-demo#readme)
