import { RepositoryContainer } from '../../domain.js'
import { DisabledLure, EnabledLure, Lure } from '../../models/index.js'

export interface LureRepository {
  create(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<RepositoryContainer<DisabledLure>>

  read(campaignId: string, id: string): Promise<Lure | null>

  readPath(campaignId: string, path: string): Promise<EnabledLure | null>

  enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledLure>>

  disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledLure>>

  delete(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<RepositoryContainer<DisabledLure>>

  list(campaignId: string): Promise<Lure[] | null>
}
