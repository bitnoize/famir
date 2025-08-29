const DATABASE_PREFIX = 'famir'

export const campaignKey = (): string => {
  return [DATABASE_PREFIX, 'campaign'].join(':')
}

export const proxyKey = (id: string): string => {
  return [DATABASE_PREFIX, 'proxy', id].join(':')
}

export const proxyLockKey = (id: string): string => {
  return [DATABASE_PREFIX, 'proxy-lock', id].join(':')
}

export const proxyUniqueUrlKey = (): string => {
  return [DATABASE_PREFIX, 'proxy-unique-url'].join(':')
}

export const proxyIndexKey = (): string => {
  return [DATABASE_PREFIX, 'proxy-index'].join(':')
}

export const targetKey = (id: string): string => {
  return [DATABASE_PREFIX, 'target', id].join(':')
}

export const targetUniqueDonorKey = (): string => {
  return [DATABASE_PREFIX, 'target-unique-donor'].join(':')
}

export const targetUniqueMirrorKey = (): string => {
  return [DATABASE_PREFIX, 'target-unique-mirror'].join(':')
}

export const targetIndexKey = (): string => {
  return [DATABASE_PREFIX, 'target-index'].join(':')
}

export const redirectorKey = (id: string): string => {
  return [DATABASE_PREFIX, 'redirector', id].join(':')
}

export const redirectorIndexKey = (): string => {
  return [DATABASE_PREFIX, 'redirector-index'].join(':')
}

export const lureKey = (id: string): string => {
  return [DATABASE_PREFIX, 'lure', id].join(':')
}

export const lurePathKey = (path: string): string => {
  return [DATABASE_PREFIX, 'lure-path', path].join(':')
}

export const lureIndexKey = (): string => {
  return [DATABASE_PREFIX, 'lure-index'].join(':')
}

export const sessionKey = (id: string): string => {
  return [DATABASE_PREFIX, 'session', id].join(':')
}

export const sessionIndexKey = (): string => {
  return [DATABASE_PREFIX, 'session-index'].join(':')
}

export const sessionLoopIndexKey = (): string => {
  return [DATABASE_PREFIX, 'session-loop-index'].join(':')
}

// FIXME
export const sessionDropIndexKey = (): string => {
  return [DATABASE_PREFIX, 'session-drop-index'].join(':')
}

export const messageKey = (id: string): string => {
  return [DATABASE_PREFIX, 'message', id].join(':')
}

export const messageIndexKey = (): string => {
  return [DATABASE_PREFIX, 'message-index'].join(':')
}

export const messageLoopIndexKey = (): string => {
  return [DATABASE_PREFIX, 'message-loop-index'].join(':')
}

// FIXME
export const messageDropIndexKey = (): string => {
  return [DATABASE_PREFIX, 'message-drop-index'].join(':')
}

export const messageLockKey = (id: string): string => {
  return [DATABASE_PREFIX, 'message-lock', id].join(':')
}
