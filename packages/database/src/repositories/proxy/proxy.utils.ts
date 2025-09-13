import { DisabledProxy, EnabledProxy, Proxy } from '@famir/domain'
import { RawProxy } from './proxy.functions.js'

export function buildProxyModel(rawProxy: RawProxy | null): Proxy | null {
  if (rawProxy == null) {
    return null
  }

  return new Proxy(
    rawProxy.campaign_id,
    rawProxy.id,
    rawProxy.url,
    !!rawProxy.is_enabled,
    rawProxy.message_count,
    new Date(rawProxy.created_at),
    new Date(rawProxy.updated_at)
  )
}

export function buildProxyCollection(rawProxies: Array<RawProxy | null>): Array<Proxy | null> {
  return rawProxies.map((rawProxy) => buildProxyModel(rawProxy))
}

export function guardProxy(data: Proxy | null): data is Proxy {
  return data != null
}

export function guardEnabledProxy(data: Proxy | null): data is EnabledProxy {
  return guardProxy(data) && data.isEnabled
}

export function guardDisabledProxy(data: Proxy | null): data is DisabledProxy {
  return guardProxy(data) && !data.isEnabled
}

export function assertProxy(data: Proxy | null): asserts data is Proxy {
  if (!guardProxy(data)) {
    throw new Error(`Proxy lost`)
  }
}

export function assertEnabledProxy(data: Proxy | null): asserts data is EnabledProxy {
  if (!guardEnabledProxy(data)) {
    throw new Error(`EnabledProxy lost`)
  }
}

export function assertDisabledProxy(data: Proxy | null): asserts data is DisabledProxy {
  if (!guardDisabledProxy(data)) {
    throw new Error(`DisabledProxy lost`)
  }
}
