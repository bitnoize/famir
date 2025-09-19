import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '../../models/index.js'

export interface ProxyRepository {
  create(campaignId: string, id: string, url: string): Promise<DisabledProxyModel>

  read(campaignId: string, id: string): Promise<ProxyModel | null>

  readEnabled(campaignId: string, id: string): Promise<EnabledProxyModel | null>

  enable(campaignId: string, id: string): Promise<EnabledProxyModel>

  disable(campaignId: string, id: string): Promise<DisabledProxyModel>

  delete(campaignId: string, id: string): Promise<DisabledProxyModel>

  list(campaignId: string): Promise<ProxyModel[] | null>
}
