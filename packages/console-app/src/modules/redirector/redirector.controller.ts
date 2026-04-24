import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AlterRedirectorFieldData,
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  REDIRECTOR_CONTROLLER,
  REDIRECTOR_SERVICE,
  UpdateRedirectorData,
} from './redirector.js'
import { redirectorSchemas } from './redirector.schemas.js'
import { type RedirectorService } from './redirector.service.js'

/**
 * Represents a redirector controller
 *
 * @category Redirector
 */
export class RedirectorController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorController>(
      REDIRECTOR_CONTROLLER,
      (c) =>
        new RedirectorController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(REDIRECTOR_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
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
    this.router.addApiCall('createRedirector', async (data) => {
      this.validateData<CreateRedirectorData>('console-create-redirector-data', data)

      return await this.redirectorService.create(data)
    })

    this.router.addApiCall('readRedirector', async (data) => {
      this.validateData<ReadRedirectorData>('console-read-redirector-data', data)

      return await this.redirectorService.read(data)
    })

    this.router.addApiCall('updateRedirector', async (data) => {
      this.validateData<UpdateRedirectorData>('console-update-redirector-data', data)

      return await this.redirectorService.update(data)
    })

    this.router.addApiCall('appendRedirectorField', async (data) => {
      this.validateData<AlterRedirectorFieldData>('console-alter-redirector-field-data', data)

      return await this.redirectorService.appendField(data)
    })

    this.router.addApiCall('removeRedirectorField', async (data) => {
      this.validateData<AlterRedirectorFieldData>('console-alter-redirector-field-data', data)

      return await this.redirectorService.removeField(data)
    })

    this.router.addApiCall('deleteRedirector', async (data) => {
      this.validateData<DeleteRedirectorData>('console-delete-redirector-data', data)

      return await this.redirectorService.delete(data)
    })

    this.router.addApiCall('listRedirectors', async (data) => {
      this.validateData<ListRedirectorsData>('console-list-redirectors-data', data)

      return await this.redirectorService.list(data)
    })
  }
}
