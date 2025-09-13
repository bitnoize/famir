import { Campaign } from '@famir/domain'
import { RawCampaign } from './campaign.functions.js'

export function buildCampaignModel(rawCampaign: RawCampaign | null): Campaign | null {
  if (rawCampaign == null) {
    return null
  }

  return new Campaign(
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
): Array<Campaign | null> {
  return rawCampaigns.map((rawCampaign) => buildCampaignModel(rawCampaign))
}

export function guardCampaign(data: Campaign | null): data is Campaign {
  return data != null
}

export function assertCampaign(data: Campaign | null): asserts data is Campaign {
  if (!guardCampaign(data)) {
    throw new Error(`Campaign lost`)
  }
}
