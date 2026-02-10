import { ProxyModel } from '../../models/index.js'

export const PROXY_REPOSITORY = Symbol('ProxyRepository')

export interface ProxyRepository {
  create(campaignId: string, proxyId: string, url: string, lockSecret: string): Promise<void>
  read(campaignId: string, proxyId: string): Promise<ProxyModel | null>
  enable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>
  disable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>
  delete(campaignId: string, proxyId: string, lockSecret: string): Promise<void>
  list(campaignId: string): Promise<ProxyModel[] | null>
}
