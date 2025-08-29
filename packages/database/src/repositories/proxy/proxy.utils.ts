import { EnabledProxy, Proxy } from '@famir/domain'
import { RawProxy } from './proxy.functions.js'

export function buildProxyModel(rawProxy: RawProxy | null): Proxy | null {
  if (rawProxy === null) {
    return null
  }

  return new Proxy(
    rawProxy.id,
    rawProxy.url,
    !!rawProxy.is_enabled,
    rawProxy.total_count,
    rawProxy.success_count,
    rawProxy.failure_count,
    new Date(rawProxy.created_at),
    new Date(rawProxy.updated_at)
  )
}

export function buildProxyCollection(rawProxies: Array<RawProxy | null>): Array<Proxy | null> {
  return rawProxies.map((rawProxy) => buildProxyModel(rawProxy))
}

export const guardProxy = (proxy: Proxy | null): proxy is Proxy => {
  return proxy !== null
}

export const guardEnabledProxy = (proxy: Proxy | null): proxy is EnabledProxy => {
  return guardProxy(proxy) && proxy.isEnabled
}
