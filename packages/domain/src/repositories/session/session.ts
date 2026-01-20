import { SessionModel } from '../../models/index.js'

export const SESSION_REPOSITORY = Symbol('SessionRepository')

export interface SessionRepository {
  create(campaignId: string, sessionId: string): Promise<void>
  read(campaignId: string, sessionId: string): Promise<SessionModel | null>
  auth(campaignId: string, sessionId: string): Promise<SessionModel>
  upgrade(campaignId: string, lureId: string, sessionId: string, secret: string): Promise<void>
}
