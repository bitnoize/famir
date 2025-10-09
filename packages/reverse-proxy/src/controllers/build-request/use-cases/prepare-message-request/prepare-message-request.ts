import {
  CampaignModel,
  CreateMessageModel,
  EnabledTargetModel,
  HttpServerReqResHeaders,
  HttpServerRequestCookies,
  SessionModel
} from '@famir/domain'

export interface PrepareMessageRequestData {
  campaign: CampaignModel
  target: EnabledTargetModel
  session: SessionModel
  request: {
    ip: string
    method: string
    url: string
    headers: HttpServerReqResHeaders
    cookies: HttpServerRequestCookies
    body: Buffer
  }
}

export interface PrepareMessageRequestResult {
  message: CreateMessageModel
}
