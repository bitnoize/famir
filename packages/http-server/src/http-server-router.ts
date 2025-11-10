import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  HttpServerRouterSteps,
  Logger,
  LOGGER
} from '@famir/domain'

export class ImplHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer, stepNames: string[]) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new ImplHttpServerRouter(c.resolve<Logger>(LOGGER), stepNames)
    )
  }

  protected readonly steps: HttpServerRouterSteps

  constructor(
    protected readonly logger: Logger,
    protected readonly stepNames: string[]
  ) {
    this.steps = Object.fromEntries(stepNames.map((stepName) => [stepName, []]))

    this.logger.debug(`HttpServerRouter initialized`, {
      stepNames
    })
  }

  addMiddleware(stepName: string, middleware: HttpServerMiddleware) {
    if (!this.steps[stepName]) {
      throw new Error(`Step not known`)
    }

    this.steps[stepName].push(middleware)
  }

  getMiddlewares(): HttpServerMiddleware[] {
    const middlewares: HttpServerMiddleware[] = []

    this.stepNames.forEach((stepName) => {
      if (this.steps[stepName]) {
        middlewares.push(...this.steps[stepName])
      }
    })

    return middlewares
  }
}
