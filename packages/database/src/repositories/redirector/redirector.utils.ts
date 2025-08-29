import { Redirector } from '@famir/domain'
import { RawRedirector } from './redirector.functions.js'

export function buildRedirectorModel(rawRedirector: RawRedirector | null): Redirector | null {
  if (rawRedirector === null) {
    return null
  }

  return new Redirector(
    rawRedirector.id,
    rawRedirector.page,
    rawRedirector.lure_count,
    new Date(rawRedirector.created_at),
    new Date(rawRedirector.updated_at)
  )
}

export function buildRedirectorCollection(
  rawRedirectors: Array<RawRedirector | null>
): Array<Redirector | null> {
  return rawRedirectors.map((rawRedirector) => buildRedirectorModel(rawRedirector))
}

export const guardRedirector = (redirector: Redirector | null): redirector is Redirector => {
  return redirector !== null
}
