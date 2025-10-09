import { SessionModel } from '../../models/index.js'

export interface CreateSessionModel {
  campaignId: string
  sessionId: string
  secret: string
}

export interface ReadSessionModel {
  campaignId: string
  sessionId: string
}

export interface AuthSessionModel {
  campaignId: string
  sessionId: string
}

export interface UpgradeSessionModel {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}

export interface SessionRepository {
  create(data: CreateSessionModel): Promise<SessionModel>
  read(data: ReadSessionModel): Promise<SessionModel | null>
  auth(data: AuthSessionModel): Promise<SessionModel>
  upgrade(data: UpgradeSessionModel): Promise<SessionModel>
}

export const SESSION_REPOSITORY = Symbol('SessionRepository')
