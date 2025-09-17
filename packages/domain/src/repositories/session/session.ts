import { SessionModel } from '../../models/index.js'
import { RepositoryContainer } from '../../services/index.js'

export interface SessionRepository {
  create(campaignId: string, id: string, secret: string): Promise<RepositoryContainer<SessionModel>>

  read(campaignId: string, id: string): Promise<SessionModel | null>

  auth(campaignId: string, id: string): Promise<RepositoryContainer<SessionModel>>

  upgrade(
    campaignId: string,
    lureId: string,
    id: string,
    secret: string
  ): Promise<RepositoryContainer<SessionModel>>
}
