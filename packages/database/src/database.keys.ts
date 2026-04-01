const buildKey = (...args: string[]): string => {
  return args.join(':')
}

export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

export const campaignMirrorDomainsKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-mirror-domains')
}

export const campaignSessionCookieNamesKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-session-cookie-names')
}

export const campaignIndexKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-index')
}

export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

export const proxyUrlsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-urls', campaignId)
}

export const proxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-index', campaignId)
}

export const enabledProxyIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'enabled-proxy-index', campaignId)
}

export const targetKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target', campaignId, targetId)
}

export const targetLabelsKey = (prefix: string, campaignId: string, targetId: string) => {
  return buildKey(prefix, 'target-labels', campaignId, targetId)
}

export const targetDonorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-donors', campaignId)
}

export const targetMirrorsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-mirrors', campaignId)
}

export const targetMirrorHostsKey = (prefix: string) => {
  return buildKey(prefix, 'target-mirror-hosts')
}

export const targetIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-index', campaignId)
}

export const redirectorKey = (prefix: string, campaignId: string, redirectorId: string) => {
  return buildKey(prefix, 'redirector', campaignId, redirectorId)
}

export const redirectorIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'redirector-index', campaignId)
}

export const lureKey = (prefix: string, campaignId: string, lureId: string) => {
  return buildKey(prefix, 'lure', campaignId, lureId)
}

export const lurePathsKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-paths', campaignId)
}

export const lureIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-index', campaignId)
}

export const sessionKey = (prefix: string, campaignId: string, sessionId: string) => {
  return buildKey(prefix, 'session', campaignId, sessionId)
}

export const messageKey = (prefix: string, campaignId: string, messageId: string) => {
  return buildKey(prefix, 'message', campaignId, messageId)
}
