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
  target: EnabledTargetModel
  session: SessionModel
}

export interface BuildRequestResult {
  proxy: EnabledProxyModel
  targets: EnabledTargetModel[]
}
