import { Campaign } from '@famir/domain'
import { RawCampaign } from './campaign.functions.js'

export function buildCampaignModel(rawCampaign: RawCampaign | null): Campaign | null {
  if (rawCampaign === null) {
    return null
  }

  return new Campaign(
    rawCampaign.description,
    rawCampaign.landing_secret,
    rawCampaign.landing_auth_path,
    rawCampaign.landing_auth_param,
    rawCampaign.landing_lure_param,
    rawCampaign.session_cookie_name,
    rawCampaign.session_expire,
    rawCampaign.new_session_expire,
    rawCampaign.session_limit,
    rawCampaign.session_emerge_idle_time,
    rawCampaign.session_emerge_limit,
    rawCampaign.message_expire,
    rawCampaign.message_limit,
    rawCampaign.message_emerge_idle_time,
    rawCampaign.message_emerge_limit,
    rawCampaign.message_lock_expire,
    new Date(rawCampaign.created_at),
    new Date(rawCampaign.updated_at),
    rawCampaign.proxy_count,
    rawCampaign.target_count,
    rawCampaign.redirector_count,
    rawCampaign.lure_count,
    rawCampaign.session_count,
    rawCampaign.message_count
  )
}

export function buildCampaignCollection(
  rawCampaigns: Array<RawCampaign | null>
): Array<Campaign | null> {
  return rawCampaigns.map((rawCampaign) => buildCampaignModel(rawCampaign))
}

export const guardCampaign = (campaign: Campaign | null): campaign is Campaign => {
  return campaign !== null
}
