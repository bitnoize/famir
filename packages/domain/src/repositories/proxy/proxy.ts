import { ProxyModel } from '../../models/index.js'

export const PROXY_REPOSITORY = Symbol('ProxyRepository')

export interface ProxyRepository {
  create(campaignId: string, proxyId: string, url: string): Promise<ProxyModel>
  read(campaignId: string, proxyId: string): Promise<ProxyModel | null>
  enable(campaignId: string, proxyId: string): Promise<ProxyModel>
  disable(campaignId: string, proxyId: string): Promise<ProxyModel>
  delete(campaignId: string, proxyId: string): Promise<ProxyModel>
  list(campaignId: string): Promise<ProxyModel[] | null>
}
