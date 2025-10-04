import { SessionModel } from '@famir/domain'
import { RawSession } from './session.functions.js'

export function buildModel(raw: RawSession | null): SessionModel | null {
  if (raw === null) {
    return null
  }

  return new SessionModel(
    raw.campaign_id,
    raw.session_id,
    raw.proxy_id,
    raw.secret,
    !!raw.is_landing,
    raw.message_count,
    new Date(raw.created_at),
    new Date(raw.last_auth_at)
  )
}

export function buildCollection(raws: Array<RawSession | null>): Array<SessionModel | null> {
  return raws.map((raw) => buildModel(raw))
}

export function guardModel(data: SessionModel | null): data is SessionModel {
  return data !== null
}

export function assertModel(data: SessionModel | null): asserts data is SessionModel {
  if (!guardModel(data)) {
    throw new Error(`Session lost`)
  }
}
