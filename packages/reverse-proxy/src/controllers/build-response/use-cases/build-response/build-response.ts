import { CreateMessageModel, EnabledProxyModel, EnabledTargetModel } from '@famir/domain'

export interface BuildResponseData {
  proxy: EnabledProxyModel
  target: EnabledTargetModel
  createMessage: CreateMessageModel
}
