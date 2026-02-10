const buildKey = (...args: string[]): string => {
  return args.join(':')
}

export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

export const campaignLockKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign-lock', campaignId)
}

export const campaignUniqueMirrorDomainKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-unique-mirror-domain')
}

export const campaignIndexKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-index')
}

export const proxyKey = (prefix: string, campaignId: string, proxyId: string) => {
  return buildKey(prefix, 'proxy', campaignId, proxyId)
}

export const proxyUniqueUrlKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'proxy-unique-url', campaignId)
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
  return buildKey(prefix, 'target', campaignId, targetId, 'labels')
}

export const targetUniqueDonorKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-unique-donor', campaignId)
}

export const targetUniqueMirrorKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'target-unique-mirror', campaignId)
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

export const lurePathKey = (prefix: string, campaignId: string, path: string) => {
  return buildKey(prefix, 'lure-path', campaignId, path)
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
