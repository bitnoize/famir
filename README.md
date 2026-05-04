# Famir

[![Build and Deploy](https://github.com/bitnoize/famir/actions/workflows/main.yml/badge.svg)](https://github.com/bitnoize/famir/actions/workflows/main.yml)

An extensible ecosystem for creating fake website mirrors.

## What it does

Organizes a **man-in-the-middle** attack on the target site through a fake mirror on an arbitrary
domain. The ability to intercept and modify requests and responses from or to the victim.

## Applications

- **reverse-app** - Reverse proxy server with extended functionality via middleware.
- **console-app** - Campaign management console.
- **actions-app** - Task queues for background processing intercepted data.

## Key features

- Clean, modular architecture.
- Multiple phishing campaigns in one backend.
- Support HTTP streaming requests and responses.
- Reverse proxying both in transparent mode and authenticated through secret links.
- Bypass any of TLS fingerprint checks via curl-impersonate.
- Outgoing traffic via http or socks proxies.
- Resistant to errors, follows HTTP standards.
- Minimum third-party dependencies.

## Technology stack

- **Runtime:** Node.js (TypeScript)
- **Database:** Redis
- **Storage:** S3‑compatible storage
- **Edge server:** Nginx or Caddy

## Disclaimer

> This tool is intended **only for educational purposes** and legitimate penetration testing /
> research. The author assumes no responsibility for misuse.

## Links

- [Documentation](https://docs.fake-mirrors.net/)
- [Demo project](https://github.com/bitnoize/famir-demo#readme) (see the repo for usage examples)

---

_Built for security research. Use responsibly._
