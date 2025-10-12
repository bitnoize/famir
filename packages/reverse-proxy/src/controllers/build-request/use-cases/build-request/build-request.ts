import {
  CampaignModel,
  CreateMessageModel,
  EnabledProxyModel,
  EnabledTargetModel,
  HttpServerRequest,
  SessionModel
} from '@famir/domain'

export interface BuildRequestData {
  campaign: CampaignModel
  proxy: EnabledProxyModel
  target: EnabledTargetModel
  session: SessionModel
  request: HttpServerRequest
}

export interface BuildRequestResult {
  targets: EnabledTargetModel[]
  createMessage: CreateMessageModel
}
