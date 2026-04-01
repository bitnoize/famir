import { SessionModel } from '../../models/index.js'

export const SESSION_REPOSITORY = Symbol('SessionRepository')

/**
 * Session repository contract
 */
export interface SessionRepository {
  create(campaignId: string): Promise<SessionModel>
  read(campaignId: string, sessionId: string): Promise<SessionModel | null>
  auth(campaignId: string, sessionId: string): Promise<SessionModel>
  upgrade(campaignId: string, lureId: string, sessionId: string, secret: string): Promise<void>
}
