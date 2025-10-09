import { CampaignModel } from '@famir/domain'
import { RawCampaign } from './campaign.functions.js'

export function buildModel(raw: RawCampaign | null): CampaignModel | null {
  if (raw == null) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    mirrorDomain: raw.mirror_domain,
    description: raw.description,
    landingSecret: raw.landing_secret,
    landingAuthPath: raw.landing_auth_path,
    landingAuthParam: raw.landing_auth_param,
    landingLureParam: raw.landing_lure_param,
    sessionCookieName: raw.session_cookie_name,
    sessionExpire: raw.session_expire,
    newSessionExpire: raw.new_session_expire,
    messageExpire: raw.message_expire,
    proxyCount: raw.proxy_count,
    targetCount: raw.target_count,
    redirectorCount: raw.redirector_count,
    lureCount: raw.lure_count,
    sessionCount: raw.session_count,
    messageCount: raw.message_count,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at)
  }
}

export function buildCollection(raws: Array<RawCampaign | null>): Array<CampaignModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(model: CampaignModel | null): model is CampaignModel {
  return model != null
}

export function assertModel(model: CampaignModel | null): asserts model is CampaignModel {
  if (!guardModel(model)) {
    throw new Error(`Campaign lost`)
  }
}
