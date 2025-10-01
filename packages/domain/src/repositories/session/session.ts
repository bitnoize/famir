import { SessionModel } from '../../models/index.js'

export interface CreateSessionData {
  campaignId: string
  id: string
  secret: string
}

export interface ReadSessionData {
  campaignId: string
  id: string
}

export interface AuthSessionData {
  campaignId: string
  id: string
}

export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  id: string
  secret: string
}

export interface SessionRepository {
  create(data: CreateSessionData): Promise<SessionModel>
  read(data: ReadSessionData): Promise<SessionModel | null>
  auth(data: AuthSessionData): Promise<SessionModel>
  upgrade(data: UpgradeSessionData): Promise<SessionModel>
}
