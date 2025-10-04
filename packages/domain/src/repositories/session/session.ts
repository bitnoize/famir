import { SessionModel } from '../../models/index.js'

export interface CreateSessionData {
  campaignId: string
  sessionId: string
  secret: string
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
  create(data: CreateSessionData): Promise<SessionModel>
  read(data: ReadSessionData): Promise<SessionModel | null>
  auth(data: AuthSessionData): Promise<SessionModel>
  upgrade(data: UpgradeSessionData): Promise<SessionModel>
}

export const SESSION_REPOSITORY = Symbol('SessionRepository')
