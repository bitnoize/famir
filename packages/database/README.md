# @famir/database

[![npm version](https://img.shields.io/npm/v/@famir/database.svg)](https://www.npmjs.com/package/@famir/database)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Database infrastructure service.

## Installation

```sh
npm install @famir/database
```

## An Architectural Overview

This document describes the core data models used by the Famir framework from an architectural
perspective. These models are managed via Redis Functions to ensure data integrity and atomicity.

The models form a strict hierarchy, with a **Campaign** at the root, containing and orchestrating
all other resources.

### Campaign

**Purpose:** The root of all resources. A Campaign represents a single, isolated mirroring
operation. It holds the primary configuration, cryptographic secrets, and aggregated statistics for
a project.

**Architectural Role:**

- **Container & Owner:** Owns every other model (Proxies, Targets, Redirectors, Lures, Sessions,
  Messages). Deleting a campaign is possible only after deleting all related entities.
- **Locking Mechanism:** Acts as the root for a distributed lock. Any modification to a campaign or
  any entity within it requires locking the parent Campaign. This prevents race conditions.
- **Uniqueness Scope:** Enforces global uniqueness for the campaign's public-facing `mirror_domain`
  and its internal `session_cookie_name`.

**Key Relationships:**

- **Has many** `Proxy` entities (for handling traffic).
- **Has many** `Target` entities (for backend origin servers).
- **Has many** `Redirector` entities (for landing pages).
- **Has many** `Lure` entities (for specific URL paths).
- **Has many** `Session` entities (for client interactions).
- **Has many** `Message` entities (for HTTP transaction logs).

### Proxy

**Purpose:** An egress endpoint. A Proxy defines how traffic from a mirrored site is routed outwards
to donor site via HTTP or SOCKS proxies.

**Architectural Role:**

- **Traffic Forwarder:** Acts as an upstream proxy server. When a Session is created, it is
  dynamically assigned to one of the enabled Proxies.
- **Load Balancing Target:** The `Session` creation logic uses a random method of obtaining an
  available Proxy from the set of enabled ones, providing simple load balancing and failover.
- **Lifecycle Management:** Proxies can be individually enabled or disabled. Disabling a proxy
  prevents new sessions from using it. Existing sessions that attempt to re-authorize will be
  automatically re-assigned to a different enabled proxy.

**Key Relationships:**

- **Belongs to a** `Campaign`.
- **Is used by many** `Session` entities.

### Target

**Purpose:** The backend origin server. A Target defines the real website to be mirrored (e.g.,
`https://real-bank.com`). It is the source of truth for the content being impersonated.

**Architectural Role:**

- **Content Provider:** Contains full configuration for connecting to the donor (real) site,
  including subdomains, ports, timeouts, and size limits.
- **Mirror Definition:** Defines the mapping from a public-facing mirror URL (e.g.,
  `https://secure.bank.mirror-domain.com`) back to the original donor server's internal structure.
- **Lookup Hub:** The most critical role. When an HTTP request arrives at the mirror domain, Famir
  uses a dedicated `target_mirror_hosts_key` to perform a direct O(1) lookup, instantly finding the
  correct Target based on the requested `Host` header.

**Key Relationships:**

- **Belongs to a** `Campaign`.
- **Generates traffic logged as** `Message` entities.

### Redirector

**Purpose:** A "landing page" rule. A Redirector represents a specific logical page or template
(e.g., a login page, an error page) that can be served to a victim.

**Architectural Role:**

- **Template Container:** Holds the content (e.g., an HTML page) associated with a specific phishing
  step.
- **Dynamic Fields Container:** Can have arbitrary key-value `fields` attached to it, allowing for
  flexible template injection (e.g., `error_message`, `return_url`).
- **Relationship Hub for Lures:** A Redirector does not have a public URL itself but serves as the
  target for one or more `Lure` entities. Different Lures can point to the same Redirector.

**Key Relationships:**

- **Belongs to a** `Campaign`.
- **Is the parent of many** `Lure` entities. Deleting a Redirector requires its associated Lure
  count to be zero.

### Lure

**Purpose:** A specific, publicly accessible URL path (e.g., `/login`, `/reset-password`). A Lure is
the actual "phishing link" that a victim clicks.

**Architectural Role:**

- **Router:** The primary HTTP lookup mechanism. When a request arrives at a mirror domain, the
  request's path (e.g., `/login`) is used as a key to instantly find the corresponding Lure via a
  direct hash lookup.
- **Session Tracker:** Each Lure acts as a counter for the number of sessions that have been
  "upgraded" (e.g., completed a login form) through that specific path.
- **Activation Switch:** Lures can be enabled or disabled. A disabled lure will not route traffic,
  effectively turning off a specific phishing link without deleting its configuration.

**Key Relationships:**

- **Belongs to a** `Campaign`.
- **Points to a single** `Redirector`, which provides the content to serve.
- **Is the entry point for many** `Session` entities, incrementing its `session_count` when a
  session is upgraded through it.

### Session

**Purpose:** A client's browsing "visit". A Session represents an individual victim's interaction
with the mirror, from the first click to the end of their activity.

**Architectural Role:**

- **State Container:** Holds the entire state of a client's journey, including assigned `Proxy` and
  a `secret` for authentication.
- **Dynamic Proxy Assignment:** On creation, a session is randomly assigned one of the campaign's
  enabled proxies. If the assigned proxy becomes disabled, the session will be automatically
  re-assigned to a working proxy the next time it is authorized.
- **Lifecycle via TTL:** Sessions have two Time-To-Live (TTL) periods:
  1.  **Short TTL:** After creation, before authorization (e.g., user hasn't logged in yet).
  2.  **Long TTL:** After successful authorization (e.g., user is logged in).
- **Upgrade Tracking:** Tracks if a session has been "upgraded" (e.g., submitted a login form),
  linking it back to the specific `Lure` used.

**Key Relationships:**

- **Belongs to a** `Campaign`.
- **Is assigned to one** `Proxy` at a time.
- **Initiates one or more** `Message` entities (its HTTP requests/responses).

### Message

**Purpose:** An immutable audit log entry. A Message represents a single HTTP transaction (request
and response) that passed through the mirror.

**Architectural Role:**

- **Forensic Record:** The lowest level of data, storing all technical details of an HTTP exchange:
  method, URL, headers, body, status code, timing, and any errors.
- **Dummy Mode:** Supports creating a "dummy" message, which only increments counters without
  storing any payload. This is useful for high-throughput logging where full details are not needed.
- **Automatic Expiration:** Messages are automatically deleted after a campaign-defined TTL,
  preventing unbounded database growth.

**Key Relationships:**

- **Belongs to a** `Campaign`.
- **Originates from one** `Session`.
- **Is generated through one** `Proxy` and one `Target`.
- **Increments aggregated message counters on the Campaign, Proxy, Target, and Session.**

### Summary of Interactions (Typical User Flow)

1.  A **Campaign** is created with a `mirror_domain` (e.g., `secure.bank.com`).
2.  **Target(s)** are defined to point to the real bank's website.
3.  A **Redirector** is created to hold a fake login page HTML.
4.  A **Lure** is created with the path `/login`, linked to the Redirector. The path `/login` is now
    ready to serve the fake login page.
5.  **Proxy(s)** are created and enabled to forward traffic to the internet.
6.  A victim clicks a link to `https://secure.bank.com/login`.
    - The **Lure** finds its `Redirector` via the `/login` path.
    - A new **Session** is created for the victim and is randomly assigned an enabled **Proxy**.
7.  The victim submits their credentials. The **Session** is "upgraded" (marking the login as
    complete), and this increments the **Lure's** `session_count`.
8.  Every HTTP request and response (e.g., GET login page, POST credentials) is stored as a
    **Message**, linked to the **Session**, **Proxy**, and **Target**. All related counters are
    atomically incremented.
9.  The **Campaign** provides a central view of all these activities through its aggregated counters
    (`session_count`, `message_count`, etc.).
