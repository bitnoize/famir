import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  HttpServerRouterSteps
} from '@famir/domain'

export class ImplHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer, stepNames: string[]) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new ImplHttpServerRouter(stepNames)
    )
  }

  protected readonly steps: HttpServerRouterSteps

  constructor(protected readonly stepNames: string[]) {
    this.steps = Object.fromEntries(stepNames.map((stepName) => [stepName, []]))
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
