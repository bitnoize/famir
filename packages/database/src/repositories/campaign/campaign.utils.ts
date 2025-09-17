import { CampaignModel } from '@famir/domain'
import { RawCampaign } from './campaign.functions.js'

export function buildCampaignModel(rawCampaign: RawCampaign | null): CampaignModel | null {
  if (rawCampaign == null) {
    return null
  }

  return new CampaignModel(
    rawCampaign.id,
    rawCampaign.description,
    rawCampaign.landing_secret,
    rawCampaign.landing_auth_path,
    rawCampaign.landing_auth_param,
    rawCampaign.landing_lure_param,
    rawCampaign.session_cookie_name,
    rawCampaign.session_expire,
    rawCampaign.new_session_expire,
    rawCampaign.message_expire,
    rawCampaign.proxy_count,
    rawCampaign.target_count,
    rawCampaign.redirector_count,
    rawCampaign.lure_count,
    rawCampaign.session_count,
    rawCampaign.message_count,
    new Date(rawCampaign.created_at),
    new Date(rawCampaign.updated_at)
  )
}

export function buildCampaignCollection(
  rawCampaigns: Array<RawCampaign | null>
): Array<CampaignModel | null> {
  return rawCampaigns.map((rawCampaign) => buildCampaignModel(rawCampaign))
}

export function guardCampaign(data: CampaignModel | null): data is CampaignModel {
  return data != null
}

export function assertCampaign(data: CampaignModel | null): asserts data is CampaignModel {
  if (!guardCampaign(data)) {
    throw new Error(`Campaign lost`)
  }
}
