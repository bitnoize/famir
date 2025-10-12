import { EnabledTargetModel, EnabledProxyModel, CreateMessageModel } from '@famir/domain'

export interface BuildResponseData {
  proxy: EnabledProxyModel
  target: EnabledTargetModel
  createMessage: CreateMessageModel
}
