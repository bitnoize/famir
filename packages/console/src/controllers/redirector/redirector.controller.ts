import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from './redirector.js'
import {
  createRedirectorDataSchema,
  deleteRedirectorDataSchema,
  listRedirectorsDataSchema,
  readRedirectorDataSchema,
  updateRedirectorDataSchema
} from './redirector.schemas.js'
import { REDIRECTOR_SERVICE, type RedirectorService } from './redirector.service.js'

export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

export class RedirectorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorController>(
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
    return container.resolve<RedirectorController>(REDIRECTOR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly redirectorService: RedirectorService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas({
      'console-create-redirector-data': createRedirectorDataSchema,
      'console-read-redirector-data': readRedirectorDataSchema,
      'console-update-redirector-data': updateRedirectorDataSchema,
      'console-delete-redirector-data': deleteRedirectorDataSchema,
      'console-list-redirectors-data': listRedirectorsDataSchema
    })

    this.router.addApiCall('createRedirector', this.createRedirectorApiCall)
    this.router.addApiCall('readRedirector', this.readRedirectorApiCall)
    this.router.addApiCall('updateRedirector', this.updateRedirectorApiCall)
    this.router.addApiCall('deleteRedirector', this.deleteRedirectorApiCall)
    this.router.addApiCall('listRedirectors', this.listRedirectorsApiCall)

    this.logger.debug(`RedirectorController initialized`)
  }

  private createRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<CreateRedirectorData>('console-create-redirector-data', data)

    return await this.redirectorService.createRedirector(data)
  }

  private readRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ReadRedirectorData>('console-read-redirector-data', data)

    return await this.redirectorService.readRedirector(data)
  }

  private updateRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<UpdateRedirectorData>('console-update-redirector-data', data)

    return await this.redirectorService.updateRedirector(data)
  }

  private deleteRedirectorApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<DeleteRedirectorData>('console-delete-redirector-data', data)

    return await this.redirectorService.deleteRedirector(data)
  }

  private listRedirectorsApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ListRedirectorsData>('console-list-redirectors-data', data)

    return await this.redirectorService.listRedirectors(data)
  }
}
