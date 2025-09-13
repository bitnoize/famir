import { DisabledLure, EnabledLure, Lure } from '@famir/domain'
import { RawLure } from './lure.functions.js'

export function buildLureModel(rawLure: RawLure | null): Lure | null {
  if (rawLure === null) {
    return null
  }

  return new Lure(
    rawLure.campaign_id,
    rawLure.id,
    rawLure.path,
    rawLure.redirector_id,
    !!rawLure.is_enabled,
    rawLure.session_count,
    new Date(rawLure.created_at),
    new Date(rawLure.updated_at)
  )
}

export function buildLureCollection(rawLures: Array<RawLure | null>): Array<Lure | null> {
  return rawLures.map((rawLure) => buildLureModel(rawLure))
}

export function guardLure(lure: Lure | null): lure is Lure {
  return lure !== null
}

export function guardEnabledLure(lure: Lure | null): lure is EnabledLure {
  return guardLure(lure) && lure.isEnabled
}

export function guardDisabledLure(lure: Lure | null): lure is DisabledLure {
  return guardLure(lure) && !lure.isEnabled
}

export function assertLure(data: Lure | null): asserts data is Lure {
  if (!guardLure(data)) {
    throw new Error(`Lure lost`)
  }
}

export function assertEnabledLure(data: Lure | null): asserts data is EnabledLure {
  if (!guardEnabledLure(data)) {
    throw new Error(`EnabledLure lost`)
  }
}

export function assertDisabledLure(data: Lure | null): asserts data is DisabledLure {
  if (!guardDisabledLure(data)) {
    throw new Error(`DisabledLure lost`)
  }
}
