import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerLocals,
  HttpServerRequest,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { BUILD_RESPONSE_USE_CASE, BuildResponseUseCase } from './use-cases/index.js'

export const BUILD_RESPONSE_CONTROLLER = Symbol('BuildResponseController')

export class BuildResponseController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseController>(
      BUILD_RESPONSE_CONTROLLER,
      (c) =>
        new BuildResponseController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<BuildResponseUseCase>(BUILD_RESPONSE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): BuildResponseController {
    return container.resolve<BuildResponseController>(BUILD_RESPONSE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly buildResponseUseCase: BuildResponseUseCase
  ) {
    super(validator, logger, templater, 'build-response')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): Promise<undefined> => {
    try {
      this.existsLocalsProxy(locals)
      this.existsLocalsTarget(locals)
      this.existsLocalsCreateMessage(locals)

      const { proxy, target, createMessage } = locals

      await this.buildResponseUseCase.execute({
        proxy,
        target,
        createMessage
      })

      return undefined
    } catch (error) {
      this.exceptionWrapper(error, 'default')
    }
  }
}
