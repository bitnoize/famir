import { RepositoryContainer } from '../../domain.js'
import { DisabledProxy, EnabledProxy, Proxy } from '../../models/index.js'

export interface ProxyRepository {
  create(campaignId: string, id: string, url: string): Promise<RepositoryContainer<Proxy>>

  read(campaignId: string, id: string): Promise<Proxy | null>

  readEnabled(campaignId: string, id: string): Promise<EnabledProxy | null>

  enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledProxy>>

  disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledProxy>>

  delete(campaignId: string, id: string): Promise<RepositoryContainer<DisabledProxy>>

  list(campaignId: string): Promise<Proxy[] | null>
}
