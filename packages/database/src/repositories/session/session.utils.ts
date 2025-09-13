import { Session } from '@famir/domain'
import { RawSession } from './session.functions.js'

export function buildSessionModel(rawSession: RawSession | null): Session | null {
  if (rawSession === null) {
    return null
  }

  return new Session(
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
): Array<Session | null> {
  return rawSessions.map((rawSession) => buildSessionModel(rawSession))
}

export function guardSession(data: Session | null): data is Session {
  return data !== null
}

export function assertSession(data: Session | null): asserts data is Session {
  if (!guardSession(data)) {
    throw new Error(`Session lost`)
  }
}
