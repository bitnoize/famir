import { RedirectorModel } from '../../models/index.js'
import { RepositoryContainer } from '../../services/index.js'

export interface RedirectorRepository {
  create(
    campaignId: string,
    id: string,
    page: string
  ): Promise<RepositoryContainer<RedirectorModel>>

  read(campaignId: string, id: string): Promise<RedirectorModel | null>

  update(
    campaignId: string,
    id: string,
    page: string | null | undefined
  ): Promise<RepositoryContainer<RedirectorModel>>

  delete(campaignId: string, id: string): Promise<RepositoryContainer<RedirectorModel>>

  list(campaignId: string): Promise<RedirectorModel[] | null>
}
