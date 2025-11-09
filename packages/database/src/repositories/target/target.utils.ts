import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '@famir/domain'
import { RawTarget } from './target.functions.js'

export function buildModel(raw: RawTarget | null): TargetModel | null {
  if (raw === null) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    targetId: raw.target_id,
    isLanding: !!raw.is_landing,
    donorSecure: !!raw.donor_secure,
    donorSub: raw.donor_sub,
    donorDomain: raw.donor_domain,
    donorPort: raw.donor_port,
    mirrorSecure: !!raw.mirror_secure,
    mirrorSub: raw.mirror_sub,
    mirrorPort: raw.mirror_port,
    marks: raw.marks.split(' '),
    connectTimeout: raw.connect_timeout,
    timeout: raw.timeout,
    mainPage: raw.main_page,
    notFoundPage: raw.not_found_page,
    faviconIco: raw.favicon_ico,
    robotsTxt: raw.robots_txt,
    sitemapXml: raw.sitemap_xml,
    successRedirectUrl: raw.success_redirect_url,
    failureRedirectUrl: raw.failure_redirect_url,
    isEnabled: !!raw.is_enabled,
    messageCount: raw.message_count,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at)
  }
}

export function buildCollection(raws: Array<RawTarget | null>): Array<TargetModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(model: TargetModel | null): model is TargetModel {
  return model != null
}

export function guardEnabledModel(model: TargetModel | null): model is EnabledTargetModel {
  return guardModel(model) && model.isEnabled
}

export function guardDisabledModel(model: TargetModel | null): model is DisabledTargetModel {
  return guardModel(model) && !model.isEnabled
}

export function assertModel(model: TargetModel | null): asserts model is TargetModel {
  if (!guardModel(model)) {
    throw new Error(`Target lost`)
  }
}

export function assertEnabledModel(model: TargetModel | null): asserts model is EnabledTargetModel {
  if (!guardEnabledModel(model)) {
    throw new Error(`EnabledTarget lost`)
  }
}

export function assertDisabledModel(
  model: TargetModel | null
): asserts model is DisabledTargetModel {
  if (!guardDisabledModel(model)) {
    throw new Error(`DisabledTarget lost`)
  }
}
