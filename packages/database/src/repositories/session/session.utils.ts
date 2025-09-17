import { SessionModel } from '@famir/domain'
import { RawSession } from './session.functions.js'

export function buildSessionModel(rawSession: RawSession | null): SessionModel | null {
  if (rawSession === null) {
    return null
  }

  return new SessionModel(
    rawSession.campaign_id,
    rawSession.id,
    rawSession.proxy_id,
    rawSession.secret,
    !!rawSession.is_landing,
    rawSession.message_count,
    new Date(rawSession.created_at),
    new Date(rawSession.last_auth_at)
  )
}

export function buildSessionCollection(
  rawSessions: Array<RawSession | null>
): Array<SessionModel | null> {
  return rawSessions.map((rawSession) => buildSessionModel(rawSession))
}

export function guardSession(data: SessionModel | null): data is SessionModel {
  return data !== null
}

export function assertSession(data: SessionModel | null): asserts data is SessionModel {
  if (!guardSession(data)) {
    throw new Error(`Session lost`)
  }
}
