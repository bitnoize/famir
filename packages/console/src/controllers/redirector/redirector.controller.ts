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
    super(validator, logger, router, 'redirector')

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
  }

  private createRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateCreateRedirectorData(data)

      return await this.redirectorService.createRedirector(data)
    } catch (error) {
      this.handleException(error, 'createRedirector', data)
    }
  }

  private readRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadRedirectorData(data)

      return await this.redirectorService.readRedirector(data)
    } catch (error) {
      this.handleException(error, 'readRedirector', data)
    }
  }

  private updateRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateUpdateRedirectorData(data)

      return await this.redirectorService.updateRedirector(data)
    } catch (error) {
      this.handleException(error, 'updateRedirector', data)
    }
  }

  private deleteRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateDeleteRedirectorData(data)

      return await this.redirectorService.deleteRedirector(data)
    } catch (error) {
      this.handleException(error, 'deleteRedirector', data)
    }
  }

  private listRedirectorsApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateListRedirectorsData(data)

      return await this.redirectorService.listRedirectors(data)
    } catch (error) {
      this.handleException(error, 'listRedirectors', data)
    }
  }

  private validateCreateRedirectorData(value: unknown): asserts value is CreateRedirectorData {
    try {
      this.validator.assertSchema<CreateRedirectorData>('console-create-redirector-data', value)
    } catch (error) {
      throw new ReplServerError(`CreateRedirectorData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateReadRedirectorData(value: unknown): asserts value is ReadRedirectorData {
    try {
      this.validator.assertSchema<ReadRedirectorData>('console-read-redirector-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadRedirectorData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateUpdateRedirectorData(value: unknown): asserts value is UpdateRedirectorData {
    try {
      this.validator.assertSchema<UpdateRedirectorData>('console-update-redirector-data', value)
    } catch (error) {
      throw new ReplServerError(`UpdateRedirectorData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateDeleteRedirectorData(value: unknown): asserts value is DeleteRedirectorData {
    try {
      this.validator.assertSchema<DeleteRedirectorData>('console-delete-redirector-data', value)
    } catch (error) {
      throw new ReplServerError(`DeleteRedirectorData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateListRedirectorsData(value: unknown): asserts value is ListRedirectorsData {
    try {
      this.validator.assertSchema<ListRedirectorsData>('console-list-redirectors-data', value)
    } catch (error) {
      throw new ReplServerError(`ListRedirectorsData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')
