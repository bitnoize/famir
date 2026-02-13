import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from './redirector.js'
import { redirectorSchemas } from './redirector.schemas.js'
import { REDIRECTOR_SERVICE, type RedirectorService } from './redirector.service.js'

export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

export class RedirectorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      REDIRECTOR_CONTROLLER,
      (c) =>
        new RedirectorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<RedirectorService>(REDIRECTOR_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): RedirectorController {
    return container.resolve(REDIRECTOR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly redirectorService: RedirectorService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(redirectorSchemas)

    this.logger.debug(`RedirectorController initialized`)
  }

  use() {
    this.router.register('createRedirector', async (data) => {
      this.validateData<CreateRedirectorData>('console-create-redirector-data', data)

      return await this.redirectorService.create(data)
    })

    this.router.register('readRedirector', async (data) => {
      this.validateData<ReadRedirectorData>('console-read-redirector-data', data)

      return await this.redirectorService.read(data)
    })

    this.router.register('updateRedirector', async (data) => {
      this.validateData<UpdateRedirectorData>('console-update-redirector-data', data)

      return await this.redirectorService.update(data)
    })

    this.router.register('deleteRedirector', async (data) => {
      this.validateData<DeleteRedirectorData>('console-delete-redirector-data', data)

      return await this.redirectorService.delete(data)
    })

    this.router.register('listRedirectors', async (data) => {
      this.validateData<ListRedirectorsData>('console-list-redirectors-data', data)

      return await this.redirectorService.list(data)
    })
  }
}
