import { SessionModel } from '../../models/index.js'

export interface CreateSessionData {
  campaignId: string
}

export interface ReadSessionData {
  campaignId: string
  sessionId: string
}

export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}

export interface SessionRepository {
  createSession(data: CreateSessionData): Promise<SessionModel>
  readSession(data: ReadSessionData): Promise<SessionModel | null>
  authSession(data: AuthSessionData): Promise<SessionModel>
  upgradeSession(data: UpgradeSessionData): Promise<SessionModel>
}

export const SESSION_REPOSITORY = Symbol('SessionRepository')
