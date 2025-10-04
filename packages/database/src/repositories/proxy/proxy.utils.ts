import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '@famir/domain'
import { RawProxy } from './proxy.functions.js'

export function buildModel(raw: RawProxy | null): ProxyModel | null {
  if (raw == null) {
    return null
  }

  return new ProxyModel(
    raw.campaign_id,
    raw.proxy_id,
    raw.url,
    !!raw.is_enabled,
    raw.message_count,
    new Date(raw.created_at),
    new Date(raw.updated_at)
  )
}

export function buildCollection(raws: Array<RawProxy | null>): Array<ProxyModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(data: ProxyModel | null): data is ProxyModel {
  return data != null
}

export function guardEnabledModel(data: ProxyModel | null): data is EnabledProxyModel {
  return guardModel(data) && data.isEnabled
}

export function guardDisabledModel(data: ProxyModel | null): data is DisabledProxyModel {
  return guardModel(data) && !data.isEnabled
}

export function assertModel(data: ProxyModel | null): asserts data is ProxyModel {
  if (!guardModel(data)) {
    throw new Error(`Proxy lost`)
  }
}

export function assertEnabledModel(data: ProxyModel | null): asserts data is EnabledProxyModel {
  if (!guardEnabledModel(data)) {
    throw new Error(`EnabledProxy lost`)
  }
}

export function assertDisabledModel(data: ProxyModel | null): asserts data is DisabledProxyModel {
  if (!guardDisabledModel(data)) {
    throw new Error(`DisabledProxy lost`)
  }
}
