import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '../../models/index.js'
import { RepositoryContainer } from '../../services/index.js'

export interface ProxyRepository {
  create(
    campaignId: string,
    id: string,
    url: string
  ): Promise<RepositoryContainer<DisabledProxyModel>>

  read(campaignId: string, id: string): Promise<ProxyModel | null>

  readEnabled(campaignId: string, id: string): Promise<EnabledProxyModel | null>

  enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledProxyModel>>

  disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledProxyModel>>

  delete(campaignId: string, id: string): Promise<RepositoryContainer<DisabledProxyModel>>

  list(campaignId: string): Promise<ProxyModel[] | null>
}
