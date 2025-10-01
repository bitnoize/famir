import { DisabledProxyModel, EnabledProxyModel, ProxyModel } from '../../models/index.js'

export interface CreateProxyData {
  campaignId: string
  id: string
  url: string
}

export interface ReadProxyData {
  campaignId: string
  id: string
}

export interface SwitchProxyData {
  campaignId: string
  id: string
}

export interface DeleteProxyData {
  campaignId: string
  id: string
}

export interface ListProxiesData {
  campaignId: string
}

export interface ProxyRepository {
  create(data: CreateProxyData): Promise<DisabledProxyModel>
  read(data: ReadProxyData): Promise<ProxyModel | null>
  readEnabled(data: ReadProxyData): Promise<EnabledProxyModel | null>
  enable(data: SwitchProxyData): Promise<EnabledProxyModel>
  disable(data: SwitchProxyData): Promise<DisabledProxyModel>
  delete(data: DeleteProxyData): Promise<DisabledProxyModel>
  list(data: ListProxiesData): Promise<ProxyModel[] | null>
}
