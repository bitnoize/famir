import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '../../models/index.js'

export interface CreateProxyModel {
  campaignId: string
  proxyId: string
  url: string
}

export interface ReadProxyModel {
  campaignId: string
  proxyId: string
}

export interface SwitchProxyModel {
  campaignId: string
  proxyId: string
}

export interface DeleteProxyModel {
  campaignId: string
  proxyId: string
}

export interface ListProxyModels {
  campaignId: string
}

export interface ProxyRepository {
  create(data: CreateProxyModel): Promise<DisabledProxyModel>
  read(data: ReadProxyModel): Promise<ProxyModel | null>
  readEnabled(data: ReadProxyModel): Promise<EnabledProxyModel | null>
  enable(data: SwitchProxyModel): Promise<EnabledProxyModel>
  disable(data: SwitchProxyModel): Promise<DisabledProxyModel>
  delete(data: DeleteProxyModel): Promise<DisabledProxyModel>
  list(data: ListProxyModels): Promise<ProxyModel[] | null>
}

export const PROXY_REPOSITORY = Symbol('ProxyRepository')
