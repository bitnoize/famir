import { CampaignModel } from '@famir/domain'
import { RawCampaign } from './campaign.functions.js'

export function buildModel(raw: RawCampaign | null): CampaignModel | null {
  if (raw == null) {
    return null
  }

  return new CampaignModel(
    raw.id,
    raw.description,
    raw.landing_secret,
    raw.landing_auth_path,
    raw.landing_auth_param,
    raw.landing_lure_param,
    raw.session_cookie_name,
    raw.session_expire,
    raw.new_session_expire,
    raw.message_expire,
    raw.proxy_count,
    raw.target_count,
    raw.redirector_count,
    raw.lure_count,
    raw.session_count,
    raw.message_count,
    new Date(raw.created_at),
    new Date(raw.updated_at)
  )
}

export function buildCollection(raws: Array<RawCampaign | null>): Array<CampaignModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(data: CampaignModel | null): data is CampaignModel {
  return data != null
}

export function assertModel(data: CampaignModel | null): asserts data is CampaignModel {
  if (!guardModel(data)) {
    throw new Error(`Campaign lost`)
  }
}
