/**
 * Helper function to build a Redis key by joining parts with a colon.
 *
 * @param args - The parts of the key
 * @returns A colon-separated key string
 * @internal
 */
const buildKey = (...args: string[]): string => {
  return args.join(':')
}

// --- Campaign Keys ---

/**
 * Key for a specific campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The unique identifier of the campaign
 * @returns The Redis `Hash` key, like `"famir:campaign:my-phish"`
 * @category Campaign
 * @internal
 */
export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

/**
 * Key for a campaign distributed lock.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The unique identifier of the campaign
 * @returns The Redis `String` key, like `"famir:campaign-lock:my-phish"`
 * @category Campaign
 * @internal
 */
export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

/**
 * Key for all mirror domains used across campaigns.
 *
 * @param prefix - The global prefix for all keys
 * @returns The Redis `Set` key, like `"famir:campaign-mirror-domains"`
 * @category Campaign
 * @internal
 */
export const campaignMirrorDomainsKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-mirror-domains')
}

/**
 * Key for all session cookie names used across campaigns.
 *
 * @param prefix - The global prefix for all keys
 * @returns The Redis `Set` key, like `"famir:campaign-session-cookie-names"`
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNamesKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-session-cookie-names')
}

/**
 * Key for index campaigns by their creation time.
 *
 * @param prefix - The global prefix for all keys
 * @returns The Redis `Sorted set` key, like `"famir:campaign-index"`
 * @category Campaign
 * @internal
 */
export const campaignIndexKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-index')
}

// --- Proxy Keys ---

/**
 * Key for a specific proxy within a campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this proxy belongs to
 * @param proxyId - The unique identifier of the proxy
 * @returns The Redis `Hash` key, like `"famir:proxy:my-phish:default-tor"`
 * @category Proxy
 * @internal
 */
export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

/**
 * Key for all proxies URLs in campaign to ensure uniqueness.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Set` key, like `"famir:proxy-urls:my-phish"`
 * @category Proxy
 * @internal
 */
export const proxyUrlsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-urls', campaignId)
}

/**
 * Key for index campaign proxies by their creation time.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Sorted set` key, like `"famir:proxy-index:my-phish"`
 * @category Proxy
 * @internal
 */
export const proxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-index', campaignId)
}

/**
 * Key for index all enabled campaign proxies by their creation time.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Sorted set` key, like `"famir:enabled-proxy-index:my-phish"`
 * @category Proxy
 * @internal
 */
export const enabledProxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'enabled-proxy-index', campaignId)
}

// --- Target Keys ---

/**
 * Key for a specific target within a campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this target belongs to
 * @param targetId - The unique identifier of the target
 * @returns The Redis `Hash` key, like `"famir:target:my-phish:www"`
 * @category Target
 * @internal
 */
export const targetKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target', campaignId, targetId)
}

/**
 * Key for labels attached to a specific target.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this target belongs to
 * @param targetId - The unique identifier of the target
 * @returns The Redis `Set` key, like `"famir:target-labels:my-phish:www"`
 * @category Target
 * @internal
 */
export const targetLabelsKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target-labels', campaignId, targetId)
}

/**
 * Key for all target donors (sub/domain/port) in campaign to ensure uniqueness.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Set` key, like `"famir:target-donors:my-phish"`
 * @category Target
 * @internal
 */
export const targetDonorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-donors', campaignId)
}

/**
 * Key for all target mirrors (sub/port) in campaign to ensure uniqueness.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Set` key, like `"famir:target-mirrors:my-phish"`
 * @category Target
 * @internal
 */
export const targetMirrorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-mirrors', campaignId)
}

/**
 * Key for index campaign targets by their creation time.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The index key, like `"famir:target-index:my-phish"`
 * @category Target
 * @internal
 */
export const targetIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-index', campaignId)
}

/**
 * Key for mapping a mirror hostnames to the corresponding campaign and targets IDs.
 *
 * @param prefix - The global prefix for all keys
 * @returns The Redis `Hash` key, like `"famir:target-mirror-hosts"`
 * @category Campaign
 * @internal
 */
export const targetHostsKey = (prefix: string) => {
  return buildKey(prefix, 'target-hosts')
}

// --- Redirector Keys ---

/**
 * Key for a specific redirector within a campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this redirector belongs to
 * @param proxyId - The unique identifier of the redirector
 * @returns The Redis `Hash` key, like `"famir:redirector:my-phish:simple"`
 * @category Redirector
 * @internal
 */
export const redirectorKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector', campaignId, redirectorId)
}

/**
 * Key for a dynamic fields associated with a redirector.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this redirector belongs to
 * @param proxyId - The unique identifier of the redirector
 * @returns The Redis `Set` key, like `"famir:redirector-fields:my-phish:simple"`
 * @category Redirector
 * @internal
 */
export const redirectorFieldsKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector-fields', campaignId, redirectorId)
}

/**
 * Key for index campaign redirectors by their creation time.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Sorted set` key, like `"famir:redirector-index:my-phish"`
 * @category Redirector
 * @internal
 */
export const redirectorIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'redirector-index', campaignId)
}

// --- Lure Keys ---

/**
 * Key for a specific lure within a campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this lure belongs to
 * @param proxyId - The unique identifier of the lure
 * @returns The Redis `Hash` key, like `"famir:lure:my-phish:test"`
 * @category Lure
 * @internal
 */
export const lureKey = (prefix: string, campaignId: string, lureId: string) => {
  return buildKey(prefix, 'lure', campaignId, lureId)
}

/**
 * Key for mapping a url paths to the corresponding lure IDs.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Hash` key, like `"famir:lure-paths:my-phish"`
 * @category Lure
 * @internal
 */
export const lurePathsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-paths', campaignId)
}

/**
 * Key for index campaign lures by their creation time.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign
 * @returns The Redis `Sorted set` key, like `"famir:lure-index:my-phish"`
 * @category Lure
 * @internal
 */
export const lureIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-index', campaignId)
}

// --- Session Keys ---

/**
 * Key for a specific session within a campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this session belongs to
 * @param proxyId - The unique identifier of the session
 * @returns The Redis `Hash` key, like `"famir:session:my-phish:5bfe210ae6c244c69fd91cd6c9f486b4"`
 * @category Session
 * @internal
 */
export const sessionKey = (prefix: string, campaignId: string, sessionId: string) => {
  return buildKey(prefix, 'session', campaignId, sessionId)
}

// --- Message Keys ---

/**
 * Key for a specific message within a campaign.
 *
 * @param prefix - The global prefix for all keys
 * @param campaignId - The ID of the campaign this message belongs to
 * @param proxyId - The unique identifier of the message
 * @returns The Redis `Hash` key, like `"famir:message:my-phish:eefb9884f0674ff583869aa36b4383b4"`
 * @category Message
 * @internal
 */
export const messageKey = (prefix: string, campaignId: string, messageId: string) => {
  return buildKey(prefix, 'message', campaignId, messageId)
}
