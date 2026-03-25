# Famir

A framework for building complex infrastructure for HTTP traffic security research through a man-in-the-middle attack.
It helps organize a network of mirrors for sites and process/modify intercepted data.
See [demo-project](https://github.com/bitnoize/famir-demo) for example usage.

Features
--------

- Clean architecture, modular design.
- Multiple phishing campaigns in one project.
- Support HTTP streaming requests and responses.
- Reverse proxying both in transparent mode and through secret links aka 'lures'.
- Bypass any of TLS fingerprint checks.
- Outgoing traffic via http or socks proxies.
- Minimum third-party dependencies.
- Resistant to errors, follows standards.

Stack
-----

- Node.js, Typescript.
- Any of fast web-server like Nginx or Caddy.
- Redis as main database.
- S3-like storage.

Disclaimer
----------

This tool is made only for educational purposes and can be used in legitimate penetration tests or research only.
Author does not take any responsibility for any actions taken by its users.

