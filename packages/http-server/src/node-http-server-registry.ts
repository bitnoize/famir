import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_REGISTRY,
  HttpServerMiddleware,
  HttpServerRegistry,
  HttpServerRegistrySteps,
  Logger,
  LOGGER
} from '@famir/domain'

export class NodeHttpServerRegistry implements HttpServerRegistry {
  static inject(container: DIContainer, stepNames: string[]) {
    container.registerSingleton<HttpServerRegistry>(
      HTTP_SERVER_REGISTRY,
      (c) => new NodeHttpServerRegistry(c.resolve<Logger>(LOGGER), stepNames)
    )
  }

  protected readonly steps: HttpServerRegistrySteps

  constructor(
    protected readonly logger: Logger,
    protected readonly stepNames: string[]
  ) {
    this.steps = Object.fromEntries(stepNames.map((stepName) => [stepName, []]))

    this.logger.debug(`HttpServerRegistry initialized`, {
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
