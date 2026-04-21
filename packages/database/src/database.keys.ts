const buildKey = (...args: string[]): string => {
  return args.join(':')
}

/**
 * @category Campaign
 * @internal
 */
export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

/**
 * @category Campaign
 * @internal
 */
export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

/**
 * @category Campaign
 * @internal
 */
export const campaignMirrorDomainsKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-mirror-domains')
}

/**
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNamesKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-session-cookie-names')
}

/**
 * @category Campaign
 * @internal
 */
export const campaignIndexKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-index')
}

/**
 * @category Proxy
 * @internal
 */
export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

/**
 * @category Proxy
 * @internal
 */
export const proxyUrlsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-urls', campaignId)
}

/**
 * @category Proxy
 * @internal
 */
export const proxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-index', campaignId)
}

/**
 * @category Proxy
 * @internal
 */
export const enabledProxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'enabled-proxy-index', campaignId)
}

/**
 * @category Target
 * @internal
 */
export const targetKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target', campaignId, targetId)
}

/**
 * @category Target
 * @internal
 */
export const targetLabelsKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target-labels', campaignId, targetId)
}

/**
 * @category Target
 * @internal
 */
export const targetDonorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-donors', campaignId)
}

/**
 * @category Target
 * @internal
 */
export const targetMirrorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-mirrors', campaignId)
}

/**
 * @category Target
 * @internal
 */
export const targetMirrorHostsKey = (prefix: string) => {
  return buildKey(prefix, 'target-mirror-hosts')
}

/**
 * @category Target
 * @internal
 */
export const targetIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-index', campaignId)
}

/**
 * @category Redirector
 * @internal
 */
export const redirectorKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector', campaignId, redirectorId)
}

/**
 * @category Redirector
 * @internal
 */
export const redirectorFieldsKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector-fields', campaignId, redirectorId)
}

/**
 * @category Redirector
 * @internal
 */
export const redirectorIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'redirector-index', campaignId)
}

/**
 * @category Lure
 * @internal
 */
export const lureKey = (prefix: string, campaignId: string, lureId: string) => {
  return buildKey(prefix, 'lure', campaignId, lureId)
}

/**
 * @category Lure
 * @internal
 */
export const lurePathsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-paths', campaignId)
}

/**
 * @category Lure
 * @internal
 */
export const lureIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-index', campaignId)
}

/**
 * @category Session
 * @internal
 */
export const sessionKey = (prefix: string, campaignId: string, sessionId: string) => {
  return buildKey(prefix, 'session', campaignId, sessionId)
}

/**
 * @category Message
 * @internal
 */
export const messageKey = (prefix: string, campaignId: string, messageId: string) => {
  return buildKey(prefix, 'message', campaignId, messageId)
}
