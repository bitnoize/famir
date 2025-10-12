import { SessionModel } from '@famir/domain'
import { RawSession } from './session.functions.js'

export function buildModel(raw: RawSession | null): SessionModel | null {
  if (!raw) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    sessionId: raw.session_id,
    proxyId: raw.proxy_id,
    secret: raw.secret,
    isLanding: !!raw.is_landing,
    messageCount: raw.message_count,
    createdAt: new Date(raw.created_at),
    lastAuthAt: new Date(raw.last_auth_at)
  }
}

export function buildCollection(raws: Array<RawSession | null>): Array<SessionModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(model: SessionModel | null): model is SessionModel {
  return model !== null
}

export function assertModel(model: SessionModel | null): asserts model is SessionModel {
  if (!guardModel(model)) {
    throw new Error(`Session lost`)
  }
}
