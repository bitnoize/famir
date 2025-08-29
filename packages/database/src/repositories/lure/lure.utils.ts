import { EnabledLure, Lure } from '@famir/domain'
import { RawLure } from './lure.functions.js'

export function buildLureModel(rawLure: RawLure | null): Lure | null {
  if (rawLure === null) {
    return null
  }

  return new Lure(
    rawLure.id,
    rawLure.path,
    rawLure.redirector_id,
    !!rawLure.is_enabled,
    rawLure.auth_count,
    new Date(rawLure.created_at),
    new Date(rawLure.updated_at)
  )
}

export function buildLureCollection(rawLures: Array<RawLure | null>): Array<Lure | null> {
  return rawLures.map((rawLure) => buildLureModel(rawLure))
}

export const guardLure = (lure: Lure | null): lure is Lure => {
  return lure !== null
}

export const guardEnabledLure = (lure: Lure | null): lure is EnabledLure => {
  return guardLure(lure) && lure.isEnabled
}
