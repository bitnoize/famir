/**
 * Helper function to build a Redis key by joining parts with a colon.
 *
 * It is important that the parts do not contain the ':' separator symbol.
 *
 * @param args - The parts of the key.
 * @returns The colon-separated key string.
 */
const buildKey = (...args: string[]): string => {
  return args.join(':')
}

// --- Campaign Keys ---

/**
 * Key for a specific campaign.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Hash` key, like 'famir:campaign:httpbin'.
 *
 * @category Campaign
 * @internal
 */
export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

/**
 * Key for a campaign distributed lock.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `String` key, like 'famir:campaign-lock:httpbin'.
 *
 * @category Campaign
 * @internal
 */
export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

/**
 * Key for all mirror domains used across campaigns.
 *
 * @param prefix - The global prefix for all keys.
 * @returns The Redis `Set` key, like 'famir:campaign-mirror-domains'.
 *
 * @category Campaign
 * @internal
 */
export const campaignMirrorDomainsKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-mirror-domains')
}

/**
 * Key for all session cookie names used across campaigns.
 *
 * @param prefix - The global prefix for all keys.
 * @returns The Redis `Set` key, like 'famir:campaign-session-cookie-names'.
 *
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNamesKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-session-cookie-names')
}

/**
 * Key for index campaigns by their creation time.
 *
 * @param prefix - The global prefix for all keys.
 * @returns The Redis `Sorted set` key, like 'famir:campaign-index'.
 *
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
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param proxyId - The unique proxy ID.
 * @returns The Redis `Hash` key, like 'famir:proxy:httpbin:default-tor'.
 *
 * @category Proxy
 * @internal
 */
export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

/**
 * Key for all proxies URLs in campaign to ensure uniqueness.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Set` key, like 'famir:proxy-urls:httpbin'.
 *
 * @category Proxy
 * @internal
 */
export const proxyUrlsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-urls', campaignId)
}

/**
 * Key for index campaign proxies by their creation time.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Sorted set` key, like 'famir:proxy-index:httpbin'.
 *
 * @category Proxy
 * @internal
 */
export const proxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-index', campaignId)
}

/**
 * Key for index all enabled campaign proxies.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Set` key, like 'famir:enabled-proxy-index:httpbin'.
 *
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
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param targetId - The unique target ID.
 * @returns The Redis `Hash` key, like 'famir:target:httpbin:www'.
 *
 * @category Target
 * @internal
 */
export const targetKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target', campaignId, targetId)
}

/**
 * Key for labels attached to a specific target.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param targetId - The unique target ID.
 * @returns The Redis `Set` key, like 'famir:target-labels:httpbin:www'.
 *
 * @category Target
 * @internal
 */
export const targetLabelsKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target-labels', campaignId, targetId)
}

/**
 * Key for all target donors (sub/domain/port) in campaign to ensure uniqueness.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Set` key, like 'famir:target-donors:httpbin'.
 *
 * @category Target
 * @internal
 */
export const targetDonorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-donors', campaignId)
}

/**
 * Key for all target mirrors (sub/port) in campaign to ensure uniqueness.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Set` key, like 'famir:target-mirrors:httpbin'.
 *
 * @category Target
 * @internal
 */
export const targetMirrorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-mirrors', campaignId)
}

/**
 * Key for index campaign targets by their creation time.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Sorted set` key, like 'famir:target-index:httpbin'.
 *
 * @category Target
 * @internal
 */
export const targetIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-index', campaignId)
}

/**
 * Key for mapping a mirror hostnames to the corresponding campaign and targets IDs.
 *
 * @param prefix - The global prefix for all keys.
 * @returns The Redis `Hash` key, like 'famir:target-hosts'.
 *
 * @category Target
 * @internal
 */
export const targetHostsKey = (prefix: string) => {
  return buildKey(prefix, 'target-hosts')
}

// --- Redirector Keys ---

/**
 * Key for a specific redirector within a campaign.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param redirectorId - The unique redirector ID.
 * @returns The Redis `Hash` key, like 'famir:redirector:httpbin:simple'.
 *
 * @category Redirector
 * @internal
 */
export const redirectorKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector', campaignId, redirectorId)
}

/**
 * Key for a dynamic fields associated with a redirector.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param redirectorId - The unique redirector ID.
 * @returns The Redis `Set` key, like 'famir:redirector-fields:httpbin:simple'.
 *
 * @category Redirector
 * @internal
 */
export const redirectorFieldsKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector-fields', campaignId, redirectorId)
}

/**
 * Key for index campaign redirectors by their creation time.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Sorted set` key, like 'famir:redirector-index:httpbin'.
 *
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
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param lureId - The unique lure ID.
 * @returns The Redis `Hash` key, like 'famir:lure:httpbin:test'.
 *
 * @category Lure
 * @internal
 */
export const lureKey = (prefix: string, campaignId: string, lureId: string) => {
  return buildKey(prefix, 'lure', campaignId, lureId)
}

/**
 * Key for mapping a url paths to the corresponding lure IDs.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Hash` key, like 'famir:lure-paths:httpbin'.
 *
 * @category Lure
 * @internal
 */
export const lurePathsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-paths', campaignId)
}

/**
 * Key for index campaign lures by their creation time.
 *
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @returns The Redis `Sorted set` key, like 'famir:lure-index:httpbin'.
 *
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
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param sessionId - The unique session ID.
 * @returns The Redis `Hash` key, like 'famir:session:httpbin:5bfe210ae6c244c69fd91cd6c9f486b4'.
 *
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
 * @param prefix - The global prefix for all keys.
 * @param campaignId - The unique campaign ID.
 * @param messageId - The unique message ID.
 * @returns The Redis `Hash` key, like 'famir:message:httpbin:eefb9884f0674ff583869aa36b4383b4'.
 *
 * @category Message
 * @internal
 */
export const messageKey = (prefix: string, campaignId: string, messageId: string) => {
  return buildKey(prefix, 'message', campaignId, messageId)
}
