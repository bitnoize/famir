import { CampaignModel, FullTargetModel } from '../../models/index.js'
import { HttpBodyWrapper } from './http-body-wrapper.js'
import { HttpHeadersWrapper } from './http-headers-wrapper.js'
import { HttpMethodWrapper } from './http-method-wrapper.js'
import { HttpUrlWrapper } from './http-url-wrapper.js'
import { HttpStatusWrapper } from './http-status-wrapper.js'

export interface HttpMessageUrlOptions {
  rewriteUrl: {
    schemes: unknown[]
  }
  parseQueryString: object
  formatQueryString: object
}

export type HttpMessageUrlHook = (
  method: HttpMethodWrapper,
  url: HttpUrlWrapper,
  options: HttpMessageUrlOptions
) => void

export interface HttpMessageHeadersOptions {
  rewriteUrl: {
    schemes: unknown[]
  }
}

export type HttpMessageHeadersHook = (
  method: HttpMethodWrapper,
  url: HttpUrlWrapper,
  headers: HttpHeadersWrapper,
  options: HttpMessageHeadersOptions
) => void

export interface HttpMessage {
  readonly messageId: string
  readonly method: HttpMethodWrapper
  readonly url: HttpUrlWrapper
  readonly requestHeaders: HttpHeadersWrapper
  readonly requestBody: HttpBodyWrapper
  readonly responseHeaders: HttpHeadersWrapper
  readonly responseBody: HttpBodyWrapper
  readonly status: HttpStatusWrapper
  initRequest(campaign: CampaignModel, target: FullTargetModel): void
  readonly urlOptions: HttpMessageUrlOptions
  addUrlHook(name: string, hook: HttpMessageUrlHook): void
  readonly headersOptions: HttpMessageHeadersOptions
  addRequestHeadersHook(name: string, hook: HttpMessageHeadersHook): void
  addResponseHeadersHook(name: string, hook: HttpMessageHeadersHook): void
  runResponseHooks(): void
  runRequestHooks(): void
}
