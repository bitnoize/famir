import { DIContainer } from '@famir/common'
import {
  createLureDataSchema,
  deleteLureDataSchema,
  listLuresDataSchema,
  readLureDataSchema,
  switchLureDataSchema
} from '@famir/database'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  Logger,
  LOGGER,
  ReadLureData,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  SwitchLureData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { LURE_SERVICE, LureService } from '../../services/index.js'
import { BaseController } from '../base/index.js'

export class LureController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<LureController>(
      LURE_CONTROLLER,
      (c) =>
        new LureController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<LureService>(LURE_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): LureController {
    return container.resolve<LureController>(LURE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly lureService: LureService
  ) {
    super(validator, logger, router, 'lure')

    this.validator.addSchemas({
      'console-create-lure-data': createLureDataSchema,
      'console-read-lure-data': readLureDataSchema,
      'console-switch-lure-data': switchLureDataSchema,
      'console-delete-lure-data': deleteLureDataSchema,
      'console-list-lures-data': listLuresDataSchema
    })

    this.router.addApiCall('createLure', this.createLureApiCall)
    this.router.addApiCall('readLure', this.readLureApiCall)
    this.router.addApiCall('enableLure', this.enableLureApiCall)
    this.router.addApiCall('disableLure', this.disableLureApiCall)
    this.router.addApiCall('deleteLure', this.deleteLureApiCall)
    this.router.addApiCall('listLures', this.listLuresApiCall)

    this.logger.debug(`LureController initialized`)
  }

  private createLureApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateCreateLureData(data)

      return await this.lureService.createLure(data)
    } catch (error) {
      this.handleException(error, 'createLure', data)
    }
  }

  private readLureApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadLureData(data)

      return await this.lureService.readLure(data)
    } catch (error) {
      this.handleException(error, 'readLure', data)
    }
  }

  private enableLureApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateSwitchLureData(data)

      return await this.lureService.enableLure(data)
    } catch (error) {
      this.handleException(error, 'enableLure', data)
    }
  }

  private disableLureApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateSwitchLureData(data)

      return await this.lureService.disableLure(data)
    } catch (error) {
      this.handleException(error, 'disableLure', data)
    }
  }

  private deleteLureApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateDeleteLureData(data)

      return await this.lureService.deleteLure(data)
    } catch (error) {
      this.handleException(error, 'deleteLure', data)
    }
  }

  private listLuresApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateListLuresData(data)

      return await this.lureService.listLures(data)
    } catch (error) {
      this.handleException(error, 'listLures', data)
    }
  }

  private validateCreateLureData(value: unknown): asserts value is CreateLureData {
    try {
      this.validator.assertSchema<CreateLureData>('console-create-lure-data', value)
    } catch (error) {
      throw new ReplServerError(`CreateLureData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateReadLureData(value: unknown): asserts value is ReadLureData {
    try {
      this.validator.assertSchema<ReadLureData>('console-read-lure-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadLureData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateSwitchLureData(value: unknown): asserts value is SwitchLureData {
    try {
      this.validator.assertSchema<SwitchLureData>('console-switch-lure-data', value)
    } catch (error) {
      throw new ReplServerError(`SwitchLureData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateDeleteLureData(value: unknown): asserts value is DeleteLureData {
    try {
      this.validator.assertSchema<DeleteLureData>('console-delete-lure-data', value)
    } catch (error) {
      throw new ReplServerError(`DeleteLureData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateListLuresData(value: unknown): asserts value is ListLuresData {
    try {
      this.validator.assertSchema<ListLuresData>('console-list-lures-data', value)
    } catch (error) {
      throw new ReplServerError(`ListLuresData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

export const LURE_CONTROLLER = Symbol('LureController')
