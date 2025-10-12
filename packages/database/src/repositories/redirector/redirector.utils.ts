import { RedirectorModel } from '@famir/domain'
import { RawRedirector } from './redirector.functions.js'

export function buildModel(raw: RawRedirector | null): RedirectorModel | null {
  if (!raw) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    redirectorId: raw.redirector_id,
    page: raw.page,
    lureCount: raw.lure_count,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at)
  }
}

export function buildCollection(raws: Array<RawRedirector | null>): Array<RedirectorModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(model: RedirectorModel | null): model is RedirectorModel {
  return model !== null
}

export function assertModel(model: RedirectorModel | null): asserts model is RedirectorModel {
  if (!guardModel(model)) {
    throw new Error(`Redirector lost`)
  }
}
