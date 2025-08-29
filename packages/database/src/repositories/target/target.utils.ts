import { EnabledTarget, Target } from '@famir/domain'
import { RawTarget } from './target.functions.js'

export function buildTargetModel(rawTarget: RawTarget | null): Target | null {
  if (rawTarget === null) {
    return null
  }

  return new Target(
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
    rawTarget.main_page,
    rawTarget.not_found_page,
    rawTarget.favicon_ico,
    rawTarget.robots_txt,
    rawTarget.sitemap_xml,
    rawTarget.success_redirect_url,
    rawTarget.failure_redirect_url,
    !!rawTarget.is_enabled,
    rawTarget.total_count,
    rawTarget.success_count,
    rawTarget.failure_count,
    new Date(rawTarget.created_at),
    new Date(rawTarget.updated_at)
  )
}

export function buildTargetCollection(rawTargets: Array<RawTarget | null>): Array<Target | null> {
  return rawTargets.map((rawTarget) => buildTargetModel(rawTarget))
}

export const guardTarget = (target: Target | null): target is Target => {
  return target !== null
}

export const guardEnabledTarget = (target: Target | null): target is EnabledTarget => {
  return guardTarget(target) && target.isEnabled
}
