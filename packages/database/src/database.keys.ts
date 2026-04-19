const buildKey = (...args: string[]): string => {
  return args.join(':')
}

/**
 * @category Keys
 * @internal
 */
export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const campaignMirrorDomainsKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-mirror-domains')
}

/**
 * @category Keys
 * @internal
 */
export const campaignSessionCookieNamesKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-session-cookie-names')
}

/**
 * @category Keys
 * @internal
 */
export const campaignIndexKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-index')
}

/**
 * @category Keys
 * @internal
 */
export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

/**
 * @category Keys
 * @internal
 */
export const proxyUrlsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-urls', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const proxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-index', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const enabledProxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'enabled-proxy-index', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const targetKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target', campaignId, targetId)
}

/**
 * @category Keys
 * @internal
 */
export const targetLabelsKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target-labels', campaignId, targetId)
}

/**
 * @category Keys
 * @internal
 */
export const targetDonorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-donors', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const targetMirrorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-mirrors', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const targetMirrorHostsKey = (prefix: string) => {
  return buildKey(prefix, 'target-mirror-hosts')
}

/**
 * @category Keys
 * @internal
 */
export const targetIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-index', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const redirectorKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector', campaignId, redirectorId)
}

/**
 * @category Keys
 * @internal
 */
export const redirectorFieldsKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector-fields', campaignId, redirectorId)
}

/**
 * @category Keys
 * @internal
 */
export const redirectorIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'redirector-index', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const lureKey = (prefix: string, campaignId: string, lureId: string) => {
  return buildKey(prefix, 'lure', campaignId, lureId)
}

/**
 * @category Keys
 * @internal
 */
export const lurePathsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-paths', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const lureIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-index', campaignId)
}

/**
 * @category Keys
 * @internal
 */
export const sessionKey = (prefix: string, campaignId: string, sessionId: string) => {
  return buildKey(prefix, 'session', campaignId, sessionId)
}

/**
 * @category Keys
 * @internal
 */
export const messageKey = (prefix: string, campaignId: string, messageId: string) => {
  return buildKey(prefix, 'message', campaignId, messageId)
}
