import {
  HttpServerError,
  RequestLocals,
  Router,
  WrapRequest,
  WrapResponse
} from '@famir/http-server'
import { Validator } from '@famir/validator'
import { GatewayUseCase } from '../../use-cases/index.js'
import { validateRequestTargetId } from './gateway.utils.js'

export class CloakingController {
  constructor(
    validator: Validator,
    router: Router,
    protected readonly gatewayUseCase: GatewayUseCase
  ) {
    router.addRoute('get', '/favicon.ico', this.faviconIcoHandler)
    router.addRoute('get', '/robots.txt', this.robotsTxtHandler)
    router.addRoute('get', '/sitemap.xml', this.sitemapXmlHandler)
    router.addRoute('all', '{*splat}', this.defaultHandler)
  }

  private readonly faviconIcoHandler = async (
    locals: RequestLocals,
    request: WrapRequest
  ): Promise<WrapResponse> => {
    assertRequestTarget(locals)

    if (locals.target.faviconIco === '') {
      return {
        statusCode: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
        cookies: {},
        body: Buffer.from(locals.target.faviconIco, 'base64')
      }
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'image/x-icon',
      },
      cookies: {},
      body: Buffer.from(locals.target.faviconIco, 'base64')
    }
  }

  private readonly robotsTxtHandler = async (
    locals: RequestLocals,
    request: WrapRequest
  ): Promise<WrapResponse> => {
    assertRequestTarget(locals)

    return {
      statusCode: 200,
      headers: {
        'content-type': 'image/x-icon',
      },
      cookies: {},
      body: Buffer.from(locals.target.faviconIco, 'base64')
    }
  }

  private readonly defaultHandler = async (
    locals: RequestLocals,
    request: WrapRequest
  ): Promise<WrapResponse | undefined> => {
    assertRequestCampaign(locals)
    assertRequestProxy(locals)
    assertRequestTarget(locals)
    assertRequestIsBot(locals)

    return undefined
  }
}
