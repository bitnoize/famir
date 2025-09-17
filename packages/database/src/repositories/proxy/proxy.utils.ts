import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '@famir/domain'
import { RawProxy } from './proxy.functions.js'

export function buildProxyModel(rawProxy: RawProxy | null): ProxyModel | null {
  if (rawProxy == null) {
    return null
  }

  return new ProxyModel(
    rawProxy.campaign_id,
    rawProxy.id,
    rawProxy.url,
    !!rawProxy.is_enabled,
    rawProxy.message_count,
    new Date(rawProxy.created_at),
    new Date(rawProxy.updated_at)
  )
}

export function buildProxyCollection(rawProxies: Array<RawProxy | null>): Array<ProxyModel | null> {
  return rawProxies.map((rawProxy) => buildProxyModel(rawProxy))
}

export function guardProxy(data: ProxyModel | null): data is ProxyModel {
  return data != null
}

export function guardEnabledProxy(data: ProxyModel | null): data is EnabledProxyModel {
  return guardProxy(data) && data.isEnabled
}

export function guardDisabledProxy(data: ProxyModel | null): data is DisabledProxyModel {
  return guardProxy(data) && !data.isEnabled
}

export function assertProxy(data: ProxyModel | null): asserts data is ProxyModel {
  if (!guardProxy(data)) {
    throw new Error(`Proxy lost`)
  }
}

export function assertEnabledProxy(data: ProxyModel | null): asserts data is EnabledProxyModel {
  if (!guardEnabledProxy(data)) {
    throw new Error(`EnabledProxy lost`)
  }
}

export function assertDisabledProxy(data: ProxyModel | null): asserts data is DisabledProxyModel {
  if (!guardDisabledProxy(data)) {
    throw new Error(`DisabledProxy lost`)
  }
}
