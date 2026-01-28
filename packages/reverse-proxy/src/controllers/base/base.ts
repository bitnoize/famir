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
  HttpMessage,
  SessionModel
} from '@famir/domain'

export interface ReverseProxyState extends HttpState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  message?: HttpMessage
}

/*
export interface ReverseProxyHandlers {
  url: {
    handlers: QueryStringHandler[]
    parseOptions: ParseQueryStringOptions & { ignoreQueryPrefix: true }
    formatOptions: FormatQueryStringOptions & { addQueryPrefix: true }
  }
  requestHeaders: {
    handlers: HeadersHandler[]
    urlSchemes: RewriteUrlScheme[]
  }
  requestBody: {
    contentType: HttpContentType
    dispatchTable: {
      Text: {
        handlers: TextHandler[]
      }
      Html: {
        handlers: HtmlHandler[]
        options: CheerioOptions
      }
    }
  }
}

export interface ReverseProxyMessage {
  messageId: string
  method: HttpMethod
  readonly url: HttpUrl
  isStreaming: boolean
  readonly requestHeaders: HttpHeaders
  requestBody: HttpBody
  readonly responseHeaders: HttpHeaders
  responseBody: HttpBody
  status: number
  connection: HttpConnection
  //handlers: ReverseProxyHandlers
}
*/
