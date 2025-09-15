const buildKey = (...args: string[]): string => {
  return args.join(':')
}

export const campaignKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'campaign', campaignId)
}

export const campaignIndexKey = (prefix: string) => {
  return buildKey(prefix, 'campaign-index')
}

export const proxyKey = (prefix: string, campaignId: string, id: string) => {
  return buildKey(prefix, 'proxy', campaignId, id)
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

export const targetKey = (prefix: string, campaignId: string, id: string) => {
  return buildKey(prefix, 'target', campaignId, id)
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

export const redirectorKey = (prefix: string, campaignId: string, id: string) => {
  return buildKey(prefix, 'redirector', campaignId, id)
}

export const redirectorIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'redirector-index', campaignId)
}

export const lureKey = (prefix: string, campaignId: string, id: string) => {
  return buildKey(prefix, 'lure', campaignId, id)
}

export const lurePathKey = (prefix: string, campaignId: string, path: string) => {
  return buildKey(prefix, 'lure-path', campaignId, path)
}

export const lureIndexKey = (prefix: string, campaignId: string) => {
  return buildKey(prefix, 'lure-index', campaignId)
}

export const sessionKey = (prefix: string, campaignId: string, id: string) => {
  return buildKey(prefix, 'session', campaignId, id)
}

export const messageKey = (prefix: string, campaignId: string, id: string) => {
  return buildKey(prefix, 'message', campaignId, id)
}
