# @famir/database

[![npm version](https://img.shields.io/npm/v/@famir/database.svg)](https://www.npmjs.com/package/@famir/database)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Redis-backed database service for the **Famir** platform.

This package provides a shared persistence layer built on top of **node-redis** library and custom
Redis Functions.

## Purpose

- Redis connection abstraction.
- Validate connection config and replies.
- Store campaign-related metadata and indexes.
- Reusable repository base class.
- Dedicated repositories via modules.

## Structure

The package is structured as:

- `src/database.ts` — Common types and definitions.
- `src/database.schemas.ts` — Various validation schemas.
- `src/database.keys.ts` — Database key builders.
- `src/database.functions.ts` — Aggregated database functions registry.
- `src/redis-database-connector.ts` — Redis-based database-connector implementation.
- `src/redis-database-manager.ts` — Redis-based database-manager implementation.
- `src/index.ts` - Package public exports.
- `src/modules/*` — Domain-specific repository implementations.

And exposes the following dependencies:

- `DatabaseConnector` via `DATABASE_CONNECTOR` token
- `DatabaseManager` via `DATABASE_MANAGER` token
- `CampaignRepository` via `CAMPAIGN_REPOSITORY` token
- `ProxyRepository` via `PROXY_REPOSITORY` token
- `TargetRepository` via `TARGET_REPOSITORY` token
- `RedirectorRepository` via `REDIRECTOR_REPOSITORY` token
- `LureRepository` via `LURE_REPOSITORY` token
- `SessionRepository` via `SESSION_REPOSITORY` token
- `MessageRepository` via `MESSAGE_REPOSITORY` token

## Redis functions

This package loads a set of Redis Lua functions for database operations. The function definitions
are generated from the source files under:

- `redis-functions/*.lua`

and then aggregated in:

- `src/redis-functions.ts`

This keeps Redis logic close to the data model and avoids repetitive application-side mutation
logic.

## Installation

```sh
npm install @famir/database
```

## Configuration

Expects the following configuration variables:

- `DATABASE_CONNECTION_URL` - Redis connection string, default: `redis://127.0.0.1:6379/0`
- `DATABASE_PREFIX` - Global prefix for all Redis keys, default: `famir`

Example:

```sh
DATABASE_CONNECTION_URL="redis://:strongpass@127.0.0.1:6379/0"
DATABASE_PREFIX="famir"
```

## Register in DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import { AjvValidator } from '@famir/validator'
import { EnvConfig } from '@famir/config'
import { PinoLogger } from '@famir/logger'
import {
  RedisDatabaseConnector,
  RedisDatabaseManager,
  RedisCampaignRepository,
  RedisProxyRepository,
  RedisTargetRepository,
  RedisRedirectorRepository,
  RedisLureRepository,
  RedisSessionRepository,
  RedisMessageRepository,
} from '@famir/database'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Register dependencies:
AjvValidator.register(container)
EnvConfig.register(container)
PinoLogger.register(container)
RedisDatabaseConnector.register(container)
RedisDatabaseManager.register(container)

// Register repositories:
RedisCampaignRepository.register(container)
RedisProxyRepository.register(container)
RedisTargetRepository.register(container)
RedisRedirectorRepository.register(container)
RedisLureRepository.register(container)
RedisSessionRepository.register(container)
RedisMessageRepository.register(container)
```

## Resolve from DI container

Example:

```ts
import { DIContainer } from '@famir/common'
import {
  DatabaseConnector,
  DATABASE_CONNECTOR,
  DatabaseManager,
  DATABASE_MANAGER,
  CampaignRepository,
  CAMPAIGN_REPOSITORY,
  ProxyRepository,
  PROXY_REPOSITORY,
  TargetRepository,
  TARGET_REPOSITORY,
  RedirectorRepository,
  REDIRECTOR_REPOSITORY,
  LureRepository,
  LURE_REPOSITORY,
  SessionRepository,
  SESSION_REPOSITORY,
  MessageRepository,
  MESSAGE_REPOSITORY,
} from '@famir/domain'

// Get the global DI container instance.
const container = DIContainer.getInstance()

// Resolve dependencies:
const connector = container.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
const manager = container.resolve<DatabaseManager>(DATABASE_MANAGER)

// Resolve repositories:
const campaignRepository = container.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY)
const proxyRepository = container.resolve<ProxyRepository>(PROXY_REPOSITORY)
const targetRepository = container.resolve<TargetRepository>(TARGET_REPOSITORY)
const redirectorRepository = container.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY)
const lureRepository = container.resolve<LureRepository>(LURE_REPOSITORY)
const sessionRepository = container.resolve<SessionRepository>(SESSION_REPOSITORY)
const messageRepository = container.resolve<MessageRepository>(MESSAGE_REPOSITORY)
```

## DatabaseConnector

The connector is responsible for establishing and managing the lifecycle of the database connection.

```ts
import { RedisDatabaseConnection } from '@famir/database'

// Establishes a connection to the database.
await connector.connect()

// Retrieves the underlying database connection.
const connection = connector.getConnection<RedisDatabaseConnection>()

// Gracefully closes a connection to the database.
await connector.close()
```

## DatabaseManager

The manager is responsible for administrative database operations such as loading custom functions
and performing cleanup tasks.

```ts
// Retrieves the database information.
const info = await manager.getInfo()
console.log(info) // string[]

// Loads all Redis Functions into the database.
await manager.loadFunctions()

// Cleans up the entire database.
await manager.cleanup()
```

## Campaign module

A campaign is the top-level container that groups all related proxies, targets, redirectors, lures,
sessions and messages together.

### CampaignModel

Represents the campaign model:

- `CampaignModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The unique identifier for the campaign.
- `mirrorDomain` - The public-facing mirror domain for the campaign.
- `isLocked` - The flag indicating if the campaign is blocked.
- `sessionCount` - The total number of sessions processed through this campaign.
- `messageCount` - The total number of messages processed through this campaign.
- `createdAt` - The date and time when the campaign was created.

### FullCampaignModel

Represents the full campaign model:

- `CampaignModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The unique identifier for the campaign.
- `mirrorDomain` - The public-facing mirror domain for the campaign.
- `description` - The human-readable description for the campaign.
- `cryptSecret` - The secret used for encrypting session data.
- `upgradeSessionPath` - The URL path that triggers a session upgrade.
- `sessionCookieName` - The name of the cookie used to track authorized sessions.
- `sessionCookieNames` - The names of the cookies used by all campaigns.
- `sessionExpire` - The TTL for an authorized session in milliseconds.
- `newSessionExpire` - The TTL for a not-yet-authorized session in milliseconds.
- `messageExpire` - The TTL for a message in milliseconds.
- `isLocked` - The flag indicating if the campaign is blocked.
- `flags` - The list of flags associated to the campaign.
- `proxyIndex` - The cardinality of proxy index related to this campaign.
- `targetIndex` - The cardinality of target index related to this campaign.
- `redirectorIndex` - The cardinality of redirector index related to this campaign.
- `lureIndex` - The cardinality of lure index related to this campaign.
- `sessionCount` - The total number of sessions processed through this campaign.
- `sessionHistory` - The cardinality of session history related to this campaign.
- `messageCount` - The total number of messages processed through this campaign.
- `messageHistory` - The cardinality of message history related to this campaign.
- `createdAt` - The date and time when the campaign was created.
- `hasFlag(flag)` - Checks if the campaign has a specific flag.

### CampaignRepository

Represents the campaign repository:

```ts
// Used further in examples.
const campaignId = 'httpbin'

// Creates a new campaign.
await campaignRepository.create(
  campaignId,
  'httpbin.fake', // mirrorDomain
  `Mirror for "httpbin.org" site.`, // description
  '$ecret', // cryptSecret
  '/famir-upgrade-session', // upgradeSessionPath
  'famir-httpbin.fake', // sessionCookieName
  24 * 3600 * 1000, // sessionExpire
  300 * 1000, // newSessionExpire
  3600 * 1000 // messageExpire
)

// Reads the campaign by its ID.
const campaign = await campaignRepository.read(campaignId)
console.log(campaign) // `CampaignModel` or `null` if not found

// Reads the full campaign by its ID.
const fullCampaign = await campaignRepository.readFull(campaignId)
console.log(fullCampaign) // `FullCampaignModel` or `null` if not found

// Acquires a distributed lock for the campaign.
const lockSecret = await campaignRepository.lock(campaignId)
console.log(lockSecret) // string like `fe09edcff8ba42fdba5b001cd844edf7`

// Releases a previously acquired lock on the campaign.
await campaignRepository.unlock(campaignId, lockSecret)

// Updates the campaign fields.
// NOTE: campaign must be locked
await campaignRepository.update(
  campaignId,
  `New campaign description`, // description
  7 * 24 * 3600 * 1000, // sessionExpire
  300 * 1000, // newSessionExpire
  24 * 3600 * 1000, // messageExpire
  lockSecret
)

// Appends named flag to the campaign.
await campaignRepository.appendFlag(campaignId, 'verbose')

// Removes named flag from the campaign.
await campaignRepository.removeFlag(campaignId, 'verbose')

// Deletes the campaign by its ID.
// NOTE: campaign must be locked
campaignRepository.delete(campaignId, lockSecret)

// Lists all campaigns.
const campaigns = await campaignRepository.list()
console.log(campaigns) // `CampaignModel[]`

// Lists all full campaigns.
const fullCampaigns = await campaignRepository.listFull()
console.log(fullCampaigns) // `FullCampaignModel[]`
```

## Proxy module

A proxy contains an upstream server that handles outgoing traffic. Proxies are automatically
load-balanced when creating and authorizing sessions.

### ProxyModel

Represents the proxy model:

- `ProxyModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `ProxyModel.isEnabled(model)` - Type guard to check if a model is enabled.`
- `campaignId` - The ID of the campaign this proxy belongs to.
- `proxyId` - The unique identifier for the proxy.
- `url` - The upstream URL for the proxy.
- `isEnabled` - The flag indicating if the proxy is currently active for traffic routing.
- `messageCount` - The total number of messages processed through this proxy.
- `createdAt` - The date and time when the proxy was created.

### ProxyRepository

Represents the proxy repository:

```ts
// Used further in examples.
const proxyId = 'default'

// Creates a new proxy.
// NOTE: campaign must be locked
await proxyRepository.create(
  campaignId,
  proxyId,
  'http://localhost:8080', // url
  true, // isEnabled
  lockSecret
)

// Reads the proxy by its ID.
const proxy = await proxyRepository.read(campaignId, proxyId)
console.log(proxy) // `ProxyModel` or `null` if not found

// Enables the proxy, making it available for traffic routing.
// NOTE: campaign must be locked
await proxyRepository.enable(campaignId, proxyId, lockSecret)

// Disables the proxy, stopping traffic routing.
// NOTE: campaign must be locked
await proxyRepository.disable(campaignId, proxyId, lockSecret)

// Deletes the proxy by its ID.
// NOTE: campaign must be locked
await proxyRepository.delete(campaignId, proxyId, lockSecret)

// Lists all proxies for the campaign
const proxies = await proxyRepository.list(campaignId)
console.log(proxies) // `ProxyModel[]` or `null` if not found
```

## Target module

A target contains the configuration that maps a mirror server to a donor server.

### TargetModel

Represents the target model:

- `TargetModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `TargetModel.isEnabled(model)` - Type guard to check if a model is enabled.
- `campaignId` - The ID of the campaign this target belongs to.
- `targetId` - The unique identifier for the target.
- `accessLevel` - The type of access level.
- `donorSecure` - The flag indicating if the donor server uses HTTPS.
- `donorSub` - The donor subdomain.
- `donorDomain` - The donor domain name.
- `donorPort` - The donor server port.
- `donorProtocol` - The donor protocol.
- `donorHostname` - The donor hostname.
- `donorHost` - The donor host.
- `donorUrl` - The full donor URL.
- `mirrorSecure` - The flag indicating if the mirror server uses HTTPS.
- `mirrorSub` - The mirror subdomain.
- `mirrorDomain` - The mirror domain.
- `mirrorPort` - The mirror server port.
- `mirrorProtocol` - The mirror protocol.
- `mirrorHostname` - The mirror hostname.
- `mirrorHost` - The mirror host.
- `mirrorUrl` - The full mirror URL.
- `label` - The label for categorization.
- `isEnabled` - The flag indicating if the target is currently active for traffic routing.
- `messageCount` - The total number of messages processed for this target.
- `createdAt` - The date and time when the target was created.

### FullTargetModel

Represents the full target model:

- `TargetModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `TargetModel.isEnabled(model)` - Type guard to check if a model is enabled.
- `campaignId` - The ID of the campaign this target belongs to.
- `targetId` - The unique identifier for the target.
- `accessLevel` - The type of access level.
- `donorSecure` - The flag indicating if the donor server uses HTTPS.
- `donorSub` - The donor subdomain.
- `donorDomain` - The donor domain name.
- `donorPort` - The donor server port.
- `donorProtocol` - The donor protocol.
- `donorHostname` - The donor hostname.
- `donorHost` - The donor host.
- `donorUrl` - The full donor URL.
- `mirrorSecure` - The flag indicating if the mirror server uses HTTPS.
- `mirrorSub` - The mirror subdomain.
- `mirrorDomain` - The mirror domain.
- `mirrorPort` - The mirror server port.
- `mirrorProtocol` - The mirror protocol.
- `mirrorHostname` - The mirror hostname.
- `mirrorHost` - The mirror host.
- `mirrorUrl` - The full mirror URL.
- `label` - The label for categorization.
- `connectTimeout` - The connection timeout in milliseconds.
- `simpleTimeout` - The simple request timeout in milliseconds.
- `streamTimeout` - The streaming request timeout in milliseconds.
- `headersSizeLimit` - The maximum headers size in bytes.
- `bodySizeLimit` - The maximum body size in bytes.
- `mainPage` - The custom main page content.
- `notFoundPage` - The custom not-found page content.
- `faviconIco` - The custom favicon.ico content.
- `robotsTxt` - The custom robots.txt content.
- `sitemapXml` - The custom sitemap.xml content.
- `allowWebSockets` - The flag indicating if WebSocket connections allowed.
- `isEnabled` - The flag indicating if the target is currently active for traffic routing.
- `messageCount` - The total number of messages processed for this target.
- `createdAt` - The date and time when the target was created.

### TargetRepository

Represents the target repository:

```ts
// Used further in examples.
const targetId = 'apex'

// Creates a new target.
// NOTE: campaign must be locked
await targetRepository.create(
  campaignId,
  targetId,
  'transparent', // accessLevel
  true, // donorSecure
  '@', // donorSub
  'httpbin.org', // donorDomain
  443, // donorPort
  false, // mirrorSecure
  '@', // mirrorSub
  80, // mirrorPort
  'httpbin', // label
  10 * 1000, // connectTimeout
  60 * 1000, // simpleTimeout
  300 * 1000, // streamTimeout
  10 * 1024, // headersSizeLimit
  10 * 1024 * 1024, // bodySizeLimit
  'main-page.html', // mainPage
  'not-found-page.html', // notFoundPage
  'favicon.ico', // faviconIco
  'robots.txt', // robotsTxt
  'sitemap.xml', // sitemapXml
  false, // allowWebSockets
  lockSecret
)

// Reads the target by its ID.
const target = await targetRepository.read(campaignId, targetId)
console.log(target) // `TargetModel` or `null` if not found

// Reads the full target by its ID.
const fullTarget = await targetRepository.readFull(campaignId, targetId)
console.log(fullTarget) // `FullTargetModel` or `null` if not found

// Reads all target hosts across all campaigns.
const targetHosts = await targetRepository.readHosts()
console.log(targetHosts) // `TargetHosts`

// Finds a target by its mirror hostname.
const target = await targetRepository.find('httpbin.org')
console.log(target) // `TargetModel` or `null` if not found

// Finds a full target by its mirror hostname.
const fullTarget = await targetRepository.findFull('httpbin.org')
console.log(fullTarget) // `FullTargetModel` or `null` if not found

// Updates the target fields.
await targetRepository.update(
  campaignId,
  targetId,
  2 * 1000, // connectTimeout
  60 * 1000, // simpleTimeout
  300 * 1000, // streamTimeout
  10 * 1024, // headersSizeLimit
  10 * 1024 * 1024, // bodySizeLimit
  'main-page.html', // mainPage
  'not-found-page.html', // notFoundPage
  'favicon.ico', // faviconIco
  'robots.txt', // robotsTxt
  'sitemap.xml', // sitemapXml
  false, // allowWebSockets
  lockSecret
)

// Enables the target, making it available for traffic routing.
await targetRepository.enable(campaignId, targetId, lockSecret)

// Disables the target, stopping traffic routing.
await targetRepository.disable(campaignId, targetId, lockSecret)

// Deletes the target by its ID.
await targetRepository.delete(campaignId, targetId, lockSecret)

// Lists all targets for the campaign.
const targets = await targetRepository.list(campaignId)
console.log(targets) // `TargetModel[]` or `null` if not found

// Lists all full targets for the campaign.
const fullTargets = await targetRepository.listFull(campaignId)
console.log(fullTargets) // `FullTargetModel[]` or `null` if not found
```

## Redirector module

A redirector contains a landing page template and a list of required field names.

### RedirectorModel

Represents the redirector model:

- `RedirectorModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The ID of the campaign this redirector belongs to.
- `redirectorId` - The unique identifier for the redirector.
- `lureCount` - The total number of lures pointing to this redirector.
- `createdAt` - The date and time when the redirector was created.

### FullRedirectorModel

Represents the full redirector model:

- `RedirectorModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The ID of the campaign this redirector belongs to.
- `redirectorId` - The unique identifier for the redirector.
- `page` - The page template.
- `fields` - The list of required field names for this redirector.
- `lureCount` - The total number of lures pointing to this redirector.
- `createdAt` - The date and time when the redirector was created.
- `isLoose` - Indicates whether this redirector is 'loose'.
- `checkParams(params)` - Checks if the provided parameters satisfy all required fields.

### RedirectorRepository

Represents the redirector repository:

```ts
// Used further in examples.
const redirectorId = 'simple'

// Creates a new redirector.
// NOTE: campaign must be locked
await redirectorRepository.create(
  campaignId,
  redirectorId,
  'simple.html', // page
  lockSecret
)

// Reads the redirector by its ID.
const redirector = await redirectorRepository.read(campaignId, redirectorId)
console.log(redirector) // `RedirectorModel` or `null` if not found

// Reads the full redirector by its ID.
const fullRedirector = await redirectorRepository.readFull(campaignId, redirectorId)
console.log(fullRedirector) // `FullRedirectorModel` or `null` if not found

// Updates the redirector fields.
// NOTE: campaign must be locked
await redirectorRepository.update(
  campaignId,
  redirectorId,
  'simple-new.html', // page
  lockSecret
)

// Deletes the redirector by its ID.
// NOTE: campaign must be locked
await redirectorRepository.delete(campaignId, redirectorId, lockSecret)

// Lists all redirectors for the campaign.
const redirectors = await redirectorRepository.list(campaignId)
console.log(redirectors) // `RedirectorModel[]` or `null` if not found

// Lists all full redirectors for the campaign.
const fullRedirectors = await redirectorRepository.list(campaignId)
console.log(fullRedirectors) // `FullRedirectorModel[]` or `null` if not found
```

## Lure module

A lure contains a URL path endpoint that maps incoming HTTP requests to a redirector. Lures are
created in a disabled state and must be explicitly enabled to start routing traffic.

### LureModel

Represents the lure model:

- `LureModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `LureModel.isEnabled(model)` - Type guard to check if a model is enabled.
- `campaignId` - The ID of the campaign this lure belongs to.
- `lureId` - The unique identifier for the lure.
- `path` - The URL path for the lure.
- `redirectorId` - The ID of the redirector that handles this lure.
- `isEnabled` - The flag indicating if the lure is currently active for request routing.
- `sessionCount` - The total number of sessions processed through this lure.
- `createdAt` - The date and time when the lure was created.

### LureRepository

Represents the lure repository:

```ts
// Used further in examples.
const lureId = 'test-1'

// Creates a new lure.
// NOTE: campaign must be locked
await lureRepository.create(
  campaignId,
  lureId,
  '/test-lure-foo-bar', // path
  redirectorId,
  lockSecret
)

// Reads the lure by its ID.
const lure = await lureRepository.read(campaignId, lureId)
console.log(lure) // `LureModel` or `null` if not found

// Enables the lure, making it available for request routing.
// NOTE: campaign must be locked
await lureRepository.enable(campaignId, lureId, lockSecret)

// Disables the lure, stopping request routing.
// NOTE: campaign must be locked
await lureRepository.disable(campaignId, lureId, lockSecret)

// Deletes the lure by its ID.
// NOTE: campaign must be locked
await lureRepository.delete(campaignId, lureId, redirectorId, lockSecret)

// Lists all lures for the campaign.
const lures = await lureRepository.list(campaignId)
console.log(lures) // `LureModel[]` or `null` if not found
```

## Session module

A session tracks a user's interaction with the mirror, including their assigned proxy, upgrade
status, and message count.

### SessionModel

Represents the session model:

- `SessionModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The ID of the campaign this session belongs to.
- `sessionId` - The unique identifier for the session.
- `proxyId` - The ID of the proxy assigned to this session.
- `secret` - The session secret for secure operations.
- `isUpgraded` - The flag indicating if the session has been upgraded.
- `isRevoked` - The flag indicating if the session has been revoked.
- `messageCount` - The total number of messages processed through this session.
- `isNew` - Indicates whether this session is considered 'new'.
- `createdAt` - The date and time when the session was created.
- `authorizedAt` - The date and time when the session was last authorized.

### SessionRepository

Represents the session repository:

```ts
// Used further in examples.
const sessionId = 'c395257a2ab14be2bfc8940c729736ff'

// Creates a new session.
const session = await sessionRepository.create(campaignId)
console.log(session) // `SessionModel`

// Reads the session by its ID.
const session = await sessionRepository.read(campaignId, sessionId)
console.log(session) // `SessionModel` or `null` if not found

// Authorizes the session by its ID.
const session = await sessionRepository.auth(campaignId, sessionId)
console.log(session) // `SessionModel`

// Upgrades the session by its ID and secret.
await sessionRepository.upgrade(
  campaignId,
  lureId,
  sessionId,
  '921c77cbc2dd49e3a758dd8251077cbb' // secret
)

// Revokes the session and stop authorization.
await sessionRepository.revoke(campaignId, sessionId)

// Lists campaign session history.
const sessions = await sessionRepository.list(campaignId, 100)
console.log(sessions) // `SessionModel[]` or `null` if not found
```

## Message module

### MessageModel

Represents the message model:

- `MessageModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The ID of the campaign this message belongs to.
- `messageId` - The unique identifier for the message.
- `proxyId` - The ID of the proxy that processed this message.
- `targetId` - The ID of the target that handled this message.
- `sessionId` - The ID of the session that generated this message.
- `type` - The message type.
- `method` - The HTTP method.
- `url` - The HTTP request URL.
- `status` - The HTTP status code.
- `analyze` - The analyze identifier.
- `startTime` - The start processing timestamp.
- `finishTime` - The finish processing timestamp.
- `totalTime` - Calculates the total processing time of the message.
- `createdAt` - The date and time when the message was created.

### FullMessageModel

Represents the full message model:

- `MessageModel.isNotNull(model)` - Type guard to filter out null models from a list.
- `campaignId` - The ID of the campaign this message belongs to.
- `messageId` - The unique identifier for the message.
- `proxyId` - The ID of the proxy that processed this message.
- `targetId` - The ID of the target that handled this message.
- `sessionId` - The ID of the session that generated this message.
- `type` - The message type.
- `method` - The HTTP method.
- `url` - The HTTP request URL.
- `requestHeaders` - The HTTP request headers.
- `requestBody` - The HTTP request body.
- `status` - The HTTP status code.
- `responseHeaders` - The HTTP response headers.
- `responseBody` - The HTTP response body.
- `connection` - The connection details.
- `payload` - The payload data extracted from the transaction.
- `errors` - The list of errors that occurred during processing.
- `analyze` - The analyze identifier.
- `startTime` - The start processing timestamp.
- `finishTime` - The finish processing timestamp.
- `totalTime` - Calculates the total processing time of the message.
- `createdAt` - The date and time when the message was created.

### MessageRepository

Represents the message repository:

```ts
// Used further in examples.
const messageId = 'fbe3a4257b3849f4967b4e28807812a0'

// Creates a new message.
await messageRepository.create(
  campaignId,
  messageId,
  proxyId,
  targetId,
  sessionId,
  'normal-simple', // type
  'GET', // method
  '/test', // url
  { Accept: 'text/plain' }, // requestHeaders
  Buffer.from(''), // requestBody
  200, // status
  { 'Content-Type': 'text/plain' }, // responseHeaders
  Buffer.from('Hello world'), // responseBody
  { ... }, // connection
  { ... }, // payload
  [ ... ], // errors
  'default', // analyze
  1793064090286395, // startTime
  1793064091173273, // finishTime
)

// Creates a new dummy message.
await messageRepository.createDummy(campaignId, messageId, proxyId, targetId, sessionId)

// Reads the message by its ID.
const message = await messageRepository.read(campaignId, messageId)
console.log(message) // `MessageModel` or `null` if not found

// Reads the full message by its ID.
const fullMessage = await messageRepository.readFull(campaignId, messageId)
console.log(fullMessage) // `FullMessageModel` or `null` if not found

// Deletes the message by its ID.
await messageRepository.delete(campaignId, messageId)

// Lists campaign message history.
const messages = await messageRepository.list(campaignId, 100)
console.log(messages) // `MessageModel[]` or `null` if not found

// Clears campaign message history.
await messageRepository.clear(campaignId)
```
