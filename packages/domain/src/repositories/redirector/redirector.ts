import { RepositoryContainer } from '../../domain.js'
import { Redirector } from '../../models/index.js'

export interface RedirectorRepository {
  create(campaignId: string, id: string, page: string): Promise<RepositoryContainer<Redirector>>

  read(campaignId: string, id: string): Promise<Redirector | null>

  update(
    campaignId: string,
    id: string,
    page: string | null | undefined
  ): Promise<RepositoryContainer<Redirector>>

  delete(campaignId: string, id: string): Promise<RepositoryContainer<Redirector>>

  list(campaignId: string): Promise<Redirector[] | null>
}
