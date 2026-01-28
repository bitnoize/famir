import { randomIdent } from '@famir/common'
import {
  FullCampaignModel,
  FullTargetModel,
  HttpStatusWrapper,
  HttpBodyWrapper,
  HttpHeadersWrapper,
  HttpMessageHeadersHook,
  HttpMessageHeadersOptions,
  HttpMessageUrlHook,
  HttpMessageUrlOptions,
  HttpMethodWrapper,
  HttpUrlWrapper,
  getTargetDonorHost,
  getTargetDonorHostname,
  getTargetDonorProtocol
} from '@famir/domain'

export class StdHttpMessage {
  readonly messageId = randomIdent()

  constructor(
    readonly method: HttpMethodWrapper,
    readonly url: HttpUrlWrapper,
    readonly requestHeaders: HttpHeadersWrapper,
    readonly requestBody: HttpBodyWrapper,
    readonly responseHeaders: HttpHeadersWrapper,
    readonly responseBody: HttpBodyWrapper,
    readonly status: HttpStatusWrapper
  ) {}

  initRequest(campaign: FullCampaignModel, target: FullTargetModel) {
    this.url.update({
      protocol: getTargetDonorProtocol(target),
      hostname: getTargetDonorHostname(target),
      port: target.donorPort.toString()
    })

    const requestHeaders = this.requestHeaders.set('Host', getTargetDonorHost(target)).delete([
      'X-Famir-Campaign-Id',
      'X-Famir-Target-Id',
      'X-Forwarded-For',
      'X-Forwarded-Host',
      'X-Forwarded-Proto'
      // ...
    ])

    const requestCookies = requestHeaders.getCookies()

    requestCookies[campaign.sessionCookieName] = undefined

    requestHeaders.setCookies(requestCookies)
  }

  readonly urlOptions: HttpMessageUrlOptions = {
    rewriteUrl: {
      schemes: []
    },

    parseQueryString: {
      //ignoreQueryPrefix: true
    },

    formatQueryString: {
      //addQueryPrefix: true
    }
  }

  private readonly urlHooks: Array<[string, HttpMessageUrlHook]> = []

  addUrlHook(name: string, hook: HttpMessageUrlHook) {
    this.urlHooks.push([name, hook])
  }

  readonly headersOptions: HttpMessageHeadersOptions = {
    rewriteUrl: {
      schemes: []
    }
  }

  private readonly requestHeadersHooks: Array<[string, HttpMessageHeadersHook]> = []

  addRequestHeadersHook(name: string, hook: HttpMessageHeadersHook) {
    this.requestHeadersHooks.push([name, hook])
  }

  private readonly responseHeadersHooks: Array<[string, HttpMessageHeadersHook]> = []

  addResponseHeadersHook(name: string, hook: HttpMessageHeadersHook) {
    this.responseHeadersHooks.push([name, hook])
  }

  runRequestHooks() {
    for (const [name, hook] of this.urlHooks) {
      hook(this.method, this.url, this.urlOptions)
    }

    for (const [name, hook] of this.requestHeadersHooks) {
      hook(this.method, this.url, this.requestHeaders, this.headersOptions)
    }

    // ...
  }

  initResponse() {
    this.responseHeaders.delete([
        'Proxy-Agent',
        'Content-Encoding'
        // ...
    ])
  }





  runResponseHooks() {
    for (const [name, hook] of this.responseHeadersHooks) {
      hook(this.method, this.url, this.responseHeaders, this.headersOptions)
    }

    // ...
  }
}
