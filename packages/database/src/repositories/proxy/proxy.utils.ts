import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '@famir/domain'
import { RawProxy } from './proxy.functions.js'

export function buildModel(raw: RawProxy | null): ProxyModel | null {
  if (!raw) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    proxyId: raw.proxy_id,
    url: raw.url,
    isEnabled: !!raw.is_enabled,
    messageCount: raw.message_count,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at)
  }
}

export function buildCollection(raws: Array<RawProxy | null>): Array<ProxyModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(model: ProxyModel | null): model is ProxyModel {
  return model != null
}

export function guardEnabledModel(model: ProxyModel | null): model is EnabledProxyModel {
  return guardModel(model) && model.isEnabled
}

export function guardDisabledModel(model: ProxyModel | null): model is DisabledProxyModel {
  return guardModel(model) && !model.isEnabled
}

export function assertModel(model: ProxyModel | null): asserts model is ProxyModel {
  if (!guardModel(model)) {
    throw new Error(`Proxy lost`)
  }
}

export function assertEnabledModel(model: ProxyModel | null): asserts model is EnabledProxyModel {
  if (!guardEnabledModel(model)) {
    throw new Error(`EnabledProxy lost`)
  }
}

export function assertDisabledModel(model: ProxyModel | null): asserts model is DisabledProxyModel {
  if (!guardDisabledModel(model)) {
    throw new Error(`DisabledProxy lost`)
  }
}
