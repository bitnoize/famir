import { Campaign } from '../../models/index.js'
import { RepositoryContainer } from '../../services/index.js'

export interface CampaignRepository {
  create(
    id: string,
    description: string,
    landingSecret: string,
    landingAuthPath: string,
    landingAuthParam: string,
    landingLureParam: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<RepositoryContainer<Campaign>>

  read(id: string): Promise<Campaign | null>

  update(
    id: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined
  ): Promise<RepositoryContainer<Campaign>>

  delete(id: string): Promise<RepositoryContainer<Campaign>>
}
