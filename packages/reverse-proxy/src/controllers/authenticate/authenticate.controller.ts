import {
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  Validator
} from '@famir/domain'
//import { AuthenticateUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
//import { validateAuthenticateData } from './authenticate.utils.js'
import {
  assertRequestLocalsCampaign,
  assertRequestLocalsTarget
} from '../../reverse-proxy.utils.js'

export class AuthenticateController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter
    //protected readonly authenticateUseCase: AuthenticateUseCase
  ) {
    super(validator, logger, 'authenticate')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse | undefined> => {
    try {
      assertRequestLocalsCampaign(request)
      assertRequestLocalsTarget(request)

      //validateAuthenticateData(this.assertSchema, data)

      //const { } = await this.authenticateUseCase.execute(data)

      //request.locals['campaign'] = campaign
      //request.locals['target'] = target

      return undefined
    } catch (error) {
      this.exceptionFilter(error, 'default', null)
    }
  }
}
