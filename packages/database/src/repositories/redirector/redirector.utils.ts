import { RedirectorModel } from '@famir/domain'
import { RawRedirector } from './redirector.functions.js'

export function buildModel(raw: RawRedirector | null): RedirectorModel | null {
  if (raw === null) {
    return null
  }

  return new RedirectorModel(
    raw.campaign_id,
    raw.redirector_id,
    raw.page,
    raw.lure_count,
    new Date(raw.created_at),
    new Date(raw.updated_at)
  )
}

export function buildCollection(raws: Array<RawRedirector | null>): Array<RedirectorModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(data: RedirectorModel | null): data is RedirectorModel {
  return data !== null
}

export function assertModel(data: RedirectorModel | null): asserts data is RedirectorModel {
  if (!guardModel(data)) {
    throw new Error(`Redirector lost`)
  }
}
