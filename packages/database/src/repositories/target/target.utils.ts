import { DisabledTarget, EnabledTarget, Target } from '@famir/domain'
import { RawTarget } from './target.functions.js'

export function buildTargetModel(rawTarget: RawTarget | null): Target | null {
  if (rawTarget === null) {
    return null
  }

  return new Target(
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

export function buildTargetCollection(rawTargets: Array<RawTarget | null>): Array<Target | null> {
  return rawTargets.map((rawTarget) => buildTargetModel(rawTarget))
}

export function guardTarget(data: Target | null): data is Target {
  return data != null
}

export function guardEnabledTarget(data: Target | null): data is EnabledTarget {
  return guardTarget(data) && data.isEnabled
}

export function guardDisabledTarget(data: Target | null): data is DisabledTarget {
  return guardTarget(data) && !data.isEnabled
}

export function assertTarget(data: Target | null): asserts data is Target {
  if (!guardTarget(data)) {
    throw new Error(`Target lost`)
  }
}

export function assertEnabledTarget(data: Target | null): asserts data is EnabledTarget {
  if (!guardEnabledTarget(data)) {
    throw new Error(`EnabledTarget lost`)
  }
}

export function assertDisabledTarget(data: Target | null): asserts data is DisabledTarget {
  if (!guardDisabledTarget(data)) {
    throw new Error(`DisabledTarget lost`)
  }
}
