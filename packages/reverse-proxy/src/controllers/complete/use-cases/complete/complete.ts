import {
  CampaignModel,
  EnabledProxyModel,
  EnabledTargetModel,
  HttpServerRequest,
  SessionModel,
  HttpServerResponse,
} from '@famir/domain'

export interface CompleteData {
  request: HttpServerRequest
  response: HttpServerResponse
  campaign: CampaignModel
  proxy: EnabledProxyModel
  target: EnabledTargetModel
  session: SessionModel
}
