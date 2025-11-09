import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_REGISTRY,
  HttpServerShare,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRegistry,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
//import { addSchemas, testAuthCookie } from './authenticate.utils.js'

export const AUTHENTICATE_CONTROLLER = Symbol('AuthenticateController')

export class AuthenticateController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<AuthenticateController>(
      AUTHENTICATE_CONTROLLER,
      (c) =>
        new AuthenticateController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): AuthenticateController {
    return container.resolve<AuthenticateController>(AUTHENTICATE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter
  ) {
    super(validator, logger, templater, 'auth-session')

    //router.setHandler('all', '{*splat}', this.landingHandler)
    //router.setHandler('all', '{*splat}', this.transparentHandler)
  }

  /*
  protected readonly transparentHandler = async (share: HttpServerShare): Promise<void> => {
    try {
      this.absentShareProxy(share)
      this.absentShareSession(share)

      this.existsShareCampaign(share)
      this.existsShareTarget(share)

      const { campaign, target } = share

      const sessionCookie = request.headers[campaign.sessionCookieName]

      //validateAuthenticateCookie(this.assertSchema, sessionCookie)

      if (target.isLanding) {
        return undefined
      }

      if (!sessionCookie) {
        const { proxy, session } = this.createSessionUseCase.execute({
          campaign,
        })

        const result: HttpServerResponse = {
          status: 302,
          headers: {
            location: request.url,
          },
          cookies: {
            [campaign.sessionCookieName]: {
              value: session.sessionId
            }
          },
          body: Buffer.alloc(0)
        }

        return result
      }

      const isValidCookie = testAuthCookie(this.assertSchema, sessionCookie)

      if (!isValidCookie) {
        // redirect null cookie

        return result
      }

      const { session } = this.authSessionUseCase.execute({
        campaign,
        sessionCookie
      })

      if (!session) {
      }

      share.proxy = proxy
      share.session = session
    } catch (error) {
      this.exceptionWrapper(error, 'transparent')
    }
  }
  */
}
