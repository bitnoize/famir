import { DisabledLureModel, EnabledLureModel, LureModel } from '@famir/domain'
import { RawLure } from './lure.functions.js'

export function buildModel(raw: RawLure | null): LureModel | null {
  if (!raw) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    lureId: raw.lure_id,
    path: raw.path,
    redirectorId: raw.redirector_id,
    isEnabled: !!raw.is_enabled,
    sessionCount: raw.session_count,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at)
  }
}

export function buildCollection(raws: Array<RawLure | null>): Array<LureModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(model: LureModel | null): model is LureModel {
  return model !== null
}

export function guardEnabledModel(model: LureModel | null): model is EnabledLureModel {
  return guardModel(model) && model.isEnabled
}

export function guardDisabledModel(model: LureModel | null): model is DisabledLureModel {
  return guardModel(model) && !model.isEnabled
}

export function assertModel(model: LureModel | null): asserts model is LureModel {
  if (!guardModel(model)) {
    throw new Error(`Lure lost`)
  }
}

export function assertEnabledModel(model: LureModel | null): asserts model is EnabledLureModel {
  if (!guardEnabledModel(model)) {
    throw new Error(`EnabledLure lost`)
  }
}

export function assertDisabledModel(model: LureModel | null): asserts model is DisabledLureModel {
  if (!guardDisabledModel(model)) {
    throw new Error(`DisabledLure lost`)
  }
}
