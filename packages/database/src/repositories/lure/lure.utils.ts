import { DisabledLureModel, EnabledLureModel, LureModel } from '@famir/domain'
import { RawLure } from './lure.functions.js'

export function buildModel(raw: RawLure | null): LureModel | null {
  if (raw === null) {
    return null
  }

  return new LureModel(
    raw.campaign_id,
    raw.lure_id,
    raw.path,
    raw.redirector_id,
    !!raw.is_enabled,
    raw.session_count,
    new Date(raw.created_at),
    new Date(raw.updated_at)
  )
}

export function buildCollection(raws: Array<RawLure | null>): Array<LureModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(data: LureModel | null): data is LureModel {
  return data !== null
}

export function guardEnabledModel(data: LureModel | null): data is EnabledLureModel {
  return guardModel(data) && data.isEnabled
}

export function guardDisabledModel(data: LureModel | null): data is DisabledLureModel {
  return guardModel(data) && !data.isEnabled
}

export function assertModel(data: LureModel | null): asserts data is LureModel {
  if (!guardModel(data)) {
    throw new Error(`Lure lost`)
  }
}

export function assertEnabledModel(data: LureModel | null): asserts data is EnabledLureModel {
  if (!guardEnabledModel(data)) {
    throw new Error(`EnabledLure lost`)
  }
}

export function assertDisabledModel(data: LureModel | null): asserts data is DisabledLureModel {
  if (!guardDisabledModel(data)) {
    throw new Error(`DisabledLure lost`)
  }
}
