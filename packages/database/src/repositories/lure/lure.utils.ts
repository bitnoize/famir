import { DisabledLureModel, EnabledLureModel, LureModel } from '@famir/domain'
import { RawLure } from './lure.functions.js'

export function buildLureModel(rawLure: RawLure | null): LureModel | null {
  if (rawLure === null) {
    return null
  }

  return new LureModel(
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

export function buildLureCollection(rawLures: Array<RawLure | null>): Array<LureModel | null> {
  return rawLures.map((rawLure) => buildLureModel(rawLure))
}

export function guardLure(lure: LureModel | null): lure is LureModel {
  return lure !== null
}

export function guardEnabledLure(lure: LureModel | null): lure is EnabledLureModel {
  return guardLure(lure) && lure.isEnabled
}

export function guardDisabledLure(lure: LureModel | null): lure is DisabledLureModel {
  return guardLure(lure) && !lure.isEnabled
}

export function assertLure(data: LureModel | null): asserts data is LureModel {
  if (!guardLure(data)) {
    throw new Error(`Lure lost`)
  }
}

export function assertEnabledLure(data: LureModel | null): asserts data is EnabledLureModel {
  if (!guardEnabledLure(data)) {
    throw new Error(`EnabledLure lost`)
  }
}

export function assertDisabledLure(data: LureModel | null): asserts data is DisabledLureModel {
  if (!guardDisabledLure(data)) {
    throw new Error(`DisabledLure lost`)
  }
}
