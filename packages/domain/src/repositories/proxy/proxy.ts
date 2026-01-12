import { ProxyModel } from '../../models/index.js'

export const PROXY_REPOSITORY = Symbol('ProxyRepository')

export interface ProxyRepository {
  create(campaignId: string, proxyId: string, url: string, lockCode: number): Promise<void>
  read(campaignId: string, proxyId: string): Promise<ProxyModel | null>
  enable(campaignId: string, proxyId: string, lockCode: number): Promise<void>
  disable(campaignId: string, proxyId: string, lockCode: number): Promise<void>
  delete(campaignId: string, proxyId: string, lockCode: number): Promise<void>
  list(campaignId: string): Promise<ProxyModel[] | null>
}
