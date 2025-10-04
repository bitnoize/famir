import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '@famir/domain'
import { RawTarget } from './target.functions.js'

export function buildModel(raw: RawTarget | null): TargetModel | null {
  if (raw === null) {
    return null
  }

  return new TargetModel(
    raw.campaign_id,
    raw.target_id,
    !!raw.is_landing,
    !!raw.donor_secure,
    raw.donor_sub,
    raw.donor_domain,
    raw.donor_port,
    !!raw.mirror_secure,
    raw.mirror_sub,
    raw.mirror_domain,
    raw.mirror_port,
    raw.connect_timeout,
    raw.timeout,
    raw.main_page,
    raw.not_found_page,
    raw.favicon_ico,
    raw.robots_txt,
    raw.sitemap_xml,
    raw.success_redirect_url,
    raw.failure_redirect_url,
    !!raw.is_enabled,
    raw.message_count,
    new Date(raw.created_at),
    new Date(raw.updated_at)
  )
}

export function buildCollection(raws: Array<RawTarget | null>): Array<TargetModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(data: TargetModel | null): data is TargetModel {
  return data != null
}

export function guardEnabledModel(data: TargetModel | null): data is EnabledTargetModel {
  return guardModel(data) && data.isEnabled
}

export function guardDisabledModel(data: TargetModel | null): data is DisabledTargetModel {
  return guardModel(data) && !data.isEnabled
}

export function assertModel(data: TargetModel | null): asserts data is TargetModel {
  if (!guardModel(data)) {
    throw new Error(`Target lost`)
  }
}

export function assertEnabledModel(data: TargetModel | null): asserts data is EnabledTargetModel {
  if (!guardEnabledModel(data)) {
    throw new Error(`EnabledTarget lost`)
  }
}

export function assertDisabledModel(data: TargetModel | null): asserts data is DisabledTargetModel {
  if (!guardDisabledModel(data)) {
    throw new Error(`DisabledTarget lost`)
  }
}
