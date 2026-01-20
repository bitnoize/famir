import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpBody,
  HttpConnection,
  HttpHeaders,
  HttpMethod,
  HttpState,
  HttpUrl,
  SessionModel
} from '@famir/domain'

export interface ReverseProxyState extends HttpState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  message?: ReverseProxyMessage
}

export interface ReverseProxyMessage {
  messageId: string
  method: HttpMethod
  url: HttpUrl
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  responseHeaders: HttpHeaders
  responseBody: HttpBody
  status: number
  connection: HttpConnection
}
