import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '../../models/index.js'

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
  createProxy(data: CreateProxyData): Promise<DisabledProxyModel>
  readProxy(data: ReadProxyData): Promise<ProxyModel | null>
  readEnabledProxy(data: ReadProxyData): Promise<EnabledProxyModel | null>
  enableProxy(data: SwitchProxyData): Promise<EnabledProxyModel>
  disableProxy(data: SwitchProxyData): Promise<DisabledProxyModel>
  deleteProxy(data: DeleteProxyData): Promise<DisabledProxyModel>
  listProxies(data: ListProxiesData): Promise<ProxyModel[] | null>
}

export const PROXY_REPOSITORY = Symbol('ProxyRepository')
