import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '@famir/domain'
import { RawTarget } from './target.functions.js'

export function buildTargetModel(rawTarget: RawTarget | null): TargetModel | null {
  if (rawTarget === null) {
    return null
  }

  return new TargetModel(
    rawTarget.campaign_id,
    rawTarget.id,
    !!rawTarget.is_landing,
    !!rawTarget.donor_secure,
    rawTarget.donor_sub,
    rawTarget.donor_domain,
    rawTarget.donor_port,
    !!rawTarget.mirror_secure,
    rawTarget.mirror_sub,
    rawTarget.mirror_domain,
    rawTarget.mirror_port,
    rawTarget.connect_timeout,
    rawTarget.timeout,
    rawTarget.main_page,
    rawTarget.not_found_page,
    rawTarget.favicon_ico,
    rawTarget.robots_txt,
    rawTarget.sitemap_xml,
    rawTarget.success_redirect_url,
    rawTarget.failure_redirect_url,
    !!rawTarget.is_enabled,
    rawTarget.message_count,
    new Date(rawTarget.created_at),
    new Date(rawTarget.updated_at)
  )
}

export function buildTargetCollection(
  rawTargets: Array<RawTarget | null>
): Array<TargetModel | null> {
  return rawTargets.map((rawTarget) => buildTargetModel(rawTarget))
}

export function guardTarget(data: TargetModel | null): data is TargetModel {
  return data != null
}

export function guardEnabledTarget(data: TargetModel | null): data is EnabledTargetModel {
  return guardTarget(data) && data.isEnabled
}

export function guardDisabledTarget(data: TargetModel | null): data is DisabledTargetModel {
  return guardTarget(data) && !data.isEnabled
}

export function assertTarget(data: TargetModel | null): asserts data is TargetModel {
  if (!guardTarget(data)) {
    throw new Error(`Target lost`)
  }
}

export function assertEnabledTarget(data: TargetModel | null): asserts data is EnabledTargetModel {
  if (!guardEnabledTarget(data)) {
    throw new Error(`EnabledTarget lost`)
  }
}

export function assertDisabledTarget(
  data: TargetModel | null
): asserts data is DisabledTargetModel {
  if (!guardDisabledTarget(data)) {
    throw new Error(`DisabledTarget lost`)
  }
}
