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
 * @category Campaign
 * @internal
 */
export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

/**
 * Key for a campaign distributed lock.
 *
 * @category Campaign
 * @internal
 */
export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

/**
 * Key for a campaign flags.
 *
 * @category Campaign
 * @internal
 */
export const campaignFlagsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-flags', campaignId)
}

/**
 * Key for all mirror domains used across campaigns.
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
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNamesKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-session-cookie-names')
}

/**
 * Key for index campaigns by their creation time.
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
 * @category Proxy
 * @internal
 */
export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

/**
 * Key for all proxies URLs in campaign to ensure uniqueness.
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
 * @category Proxy
 * @internal
 */
export const proxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-index', campaignId)
}

/**
 * Key for index all enabled campaign proxies.
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
 * @category Target
 * @internal
 */
export const targetKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target', campaignId, targetId)
}

/**
 * Key for all target donors (sub/domain/port) in campaign to ensure uniqueness.
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
 * @category Target
 * @internal
 */
export const targetMirrorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-mirrors', campaignId)
}

/**
 * Key for index campaign targets by their creation time.
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
 * @category Redirector
 * @internal
 */
export const redirectorKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector', campaignId, redirectorId)
}

/**
 * Key for a dynamic fields associated with a redirector.
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
 * @category Lure
 * @internal
 */
export const lureKey = (prefix: string, campaignId: string, lureId: string) => {
  return buildKey(prefix, 'lure', campaignId, lureId)
}

/**
 * Key for mapping a url paths to the corresponding lure IDs.
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
 * @category Session
 * @internal
 */
export const sessionKey = (prefix: string, campaignId: string, sessionId: string) => {
  return buildKey(prefix, 'session', campaignId, sessionId)
}

/**
 * Key for campaign session history by their auth time.
 *
 * @category Session
 * @internal
 */
export const sessionHistoryKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'session-history', campaignId)
}

// --- Message Keys ---

/**
 * Key for a specific message within a campaign.
 *
 * @category Message
 * @internal
 */
export const messageKey = (prefix: string, campaignId: string, messageId: string) => {
  return buildKey(prefix, 'message', campaignId, messageId)
}

/**
 * Key for campaign message history by their creation time.
 *
 * @category Message
 * @internal
 */
export const messageHistoryKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'message-history', campaignId)
}
