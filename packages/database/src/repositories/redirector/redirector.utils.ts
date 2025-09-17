import { RedirectorModel } from '@famir/domain'
import { RawRedirector } from './redirector.functions.js'

export function buildRedirectorModel(rawRedirector: RawRedirector | null): RedirectorModel | null {
  if (rawRedirector === null) {
    return null
  }

  return new RedirectorModel(
    rawRedirector.campaign_id,
    rawRedirector.id,
    rawRedirector.page,
    rawRedirector.lure_count,
    new Date(rawRedirector.created_at),
    new Date(rawRedirector.updated_at)
  )
}

export function buildRedirectorCollection(
  rawRedirectors: Array<RawRedirector | null>
): Array<RedirectorModel | null> {
  return rawRedirectors.map((rawRedirector) => buildRedirectorModel(rawRedirector))
}

export function guardRedirector(data: RedirectorModel | null): data is RedirectorModel {
  return data !== null
}

export function assertRedirector(data: RedirectorModel | null): asserts data is RedirectorModel {
  if (!guardRedirector(data)) {
    throw new Error(`Redirector lost`)
  }
}
