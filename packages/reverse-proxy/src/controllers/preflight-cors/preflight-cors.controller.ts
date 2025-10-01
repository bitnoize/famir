import { HttpServerResponse, HttpServerRouter, Logger, Validator } from '@famir/domain'
import { BaseController } from '../base/index.js'

export class PreflightCorsController extends BaseController {
  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, 'preflight-cors')

    router.setHandler('options', '{*splat}', this.defaultHandler)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private readonly defaultHandler = async (): Promise<HttpServerResponse | undefined> => {
    return {
      status: 204,
      headers: {
        'content-type': 'text/plain',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      },
      cookies: {},
      body: Buffer.from('')
    }
  }
}
