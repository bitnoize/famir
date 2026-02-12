import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerApiCall, ReplServerRouter } from '@famir/repl-server'
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

  register(): this {
    this.router
      .register('createRedirector', this.createRedirectorApiCall)
      .register('readRedirector', this.readRedirectorApiCall)
      .register('updateRedirector', this.updateRedirectorApiCall)
      .register('deleteRedirector', this.deleteRedirectorApiCall)
      .register('listRedirectors', this.listRedirectorsApiCall)

    return this
  }

  private createRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateData<CreateRedirectorData>('console-create-redirector-data', data)

    await this.redirectorService.create(data)

    return true
  }

  private readRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ReadRedirectorData>('console-read-redirector-data', data)

    return await this.redirectorService.read(data)
  }

  private updateRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateData<UpdateRedirectorData>('console-update-redirector-data', data)

    await this.redirectorService.update(data)

    return true
  }

  private deleteRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateData<DeleteRedirectorData>('console-delete-redirector-data', data)

    await this.redirectorService.delete(data)

    return true
  }

  private listRedirectorsApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ListRedirectorsData>('console-list-redirectors-data', data)

    return await this.redirectorService.list(data)
  }
}
