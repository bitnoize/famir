# Famir

A framework for building complex infrastructure for HTTP traffic security research.
See [demo](https://github.com/bitnoize/famir-demo) for example usage.

Features
--------

- Clean architecture, modular design
- Works as distributed cluster

Packages
--------

| Package | Description |
| --- | --- |
| [domain](packages/domain) | Domain layer |
| [common](packages/common) | Common utilities |
| [validator](packages/validator) | Validate data with JSON-Schema |
| [config](packages/config) | Config infrastructure service |
| [logger](packages/logger) | Logger with multiple transports |
| [database](packages/database) | Database repositories |
| [storage](packages/storage) | S3 compatable client |
| [workflow](packages/workflow) | Workflow queues |
| [executor](packages/executor) | Executor workers |
| [http-client](packages/http-client) | HTTP client |
| [http-server](packages/http-server) | HTTP server |
| [repl-server](packages/repl-server) | REPL server |
| [console](packages/console) | Console application |
| [reverse-proxy](packages/reverse-proxy) | Reverse proxy application |
| [persist-log](packages/persist-log) | Persist log application |
| [analyze-log](packages/analyze-log) | Analyze log application |


Disclaimer
----------

This tool is made only for educational purposes and can be used in legitimate penetration tests or research only.
Author does not take any responsibility for any actions taken by its users.

Similar projects
----------------

- [Evilginx](https://github.com/kgretzky/evilginx2)
- [Modlishka](https://github.com/drk1wi/Modlishka)

