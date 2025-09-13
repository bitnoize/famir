import { RepositoryContainer } from '../../domain.js'
import { Session } from '../../models/index.js'

export interface SessionRepository {
  create(campaignId: string, id: string, secret: string): Promise<RepositoryContainer<Session>>

  read(campaignId: string, id: string): Promise<Session | null>

  auth(campaignId: string, id: string): Promise<RepositoryContainer<Session>>

  upgrade(
    campaignId: string,
    lureId: string,
    id: string,
    secret: string
  ): Promise<RepositoryContainer<Session>>
}
