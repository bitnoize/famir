import { SessionModel } from '../../models/index.js'

export interface SessionRepository {
  create(campaignId: string, id: string, secret: string): Promise<SessionModel>

  read(campaignId: string, id: string): Promise<SessionModel | null>

  auth(campaignId: string, id: string): Promise<SessionModel>

  upgrade(campaignId: string, lureId: string, id: string, secret: string): Promise<SessionModel>
}
