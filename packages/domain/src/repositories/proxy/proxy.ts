import { ProxyModel } from '../../models/index.js'

export interface CreateProxyData {
  campaignId: string
  proxyId: string
  url: string
}

export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

export interface SwitchProxyData {
  campaignId: string
  proxyId: string
}

export interface DeleteProxyData {
  campaignId: string
  proxyId: string
}

export interface ListProxiesData {
  campaignId: string
}

export interface ProxyRepository {
  createProxy(data: CreateProxyData): Promise<ProxyModel>
  readProxy(data: ReadProxyData): Promise<ProxyModel | null>
  enableProxy(data: SwitchProxyData): Promise<ProxyModel>
  disableProxy(data: SwitchProxyData): Promise<ProxyModel>
  deleteProxy(data: DeleteProxyData): Promise<ProxyModel>
  listProxies(data: ListProxiesData): Promise<ProxyModel[] | null>
}

export const PROXY_REPOSITORY = Symbol('ProxyRepository')
