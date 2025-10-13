import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerLocals,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { COMPLETE_USE_CASE, CompleteUseCase } from './use-cases/index.js'

export const COMPLETE_CONTROLLER = Symbol('CompleteController')

export class CompleteController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteController>(
      COMPLETE_CONTROLLER,
      (c) =>
        new CompleteController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<CompleteUseCase>(COMPLETE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): CompleteController {
    return container.resolve<CompleteController>(COMPLETE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly completeUseCase: CompleteUseCase
  ) {
    super(validator, logger, templater, 'complete')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): Promise<HttpServerResponse> => {
    try {
      this.existsLocalsTarget(locals)
      this.existsLocalsCreateMessage(locals)

      const { target, createMessage } = locals

      const response: HttpServerResponse = {
        status: 0,
        headers: {},
        cookies: {},
        body: Buffer.alloc(0)
      }

      await this.completeUseCase.execute({ target, createMessage, response })

      return response
    } catch (error) {
      this.exceptionWrapper(error, 'default')
    }
  }
}
