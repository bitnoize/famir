const DATABASE_PREFIX = 'famir'

const buildKey = (...args: string[]): string => {
  return [DATABASE_PREFIX, ...args].join(':')
}

export const campaignKey = (campaignId: string): string => {
  return buildKey('campaign', campaignId)
}

export const proxyKey = (campaignId: string, id: string): string => {
  return buildKey('proxy', campaignId, id)
}

export const proxyUniqueUrlKey = (campaignId: string): string => {
  return buildKey('proxy-unique-url', campaignId)
}

export const proxyIndexKey = (campaignId: string): string => {
  return buildKey('proxy-index', campaignId)
}

export const enabledProxyIndexKey = (campaignId: string): string => {
  return buildKey('enabled-proxy-index', campaignId)
}

export const targetKey = (campaignId: string, id: string): string => {
  return buildKey('target', campaignId, id)
}

export const targetUniqueDonorKey = (campaignId: string): string => {
  return buildKey('target-unique-donor', campaignId)
}

export const targetUniqueMirrorKey = (campaignId: string): string => {
  return buildKey('target-unique-mirror', campaignId)
}

export const targetIndexKey = (campaignId: string): string => {
  return buildKey('target-index', campaignId)
}

export const redirectorKey = (campaignId: string, id: string): string => {
  return buildKey('redirector', campaignId, id)
}

export const redirectorIndexKey = (campaignId: string): string => {
  return buildKey('redirector-index', campaignId)
}

export const lureKey = (campaignId: string, id: string): string => {
  return buildKey('lure', campaignId, id)
}

export const lurePathKey = (campaignId: string, path: string): string => {
  return buildKey('lure-path', campaignId, path)
}

export const lureIndexKey = (campaignId: string): string => {
  return buildKey('lure-index', campaignId)
}

export const sessionKey = (campaignId: string, id: string): string => {
  return buildKey('session', campaignId, id)
}

export const messageKey = (campaignId: string, id: string): string => {
  return buildKey('message', campaignId, id)
}
