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
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from './lure.js'
import {
  createLureDataSchema,
  deleteLureDataSchema,
  listLuresDataSchema,
  readLureDataSchema,
  switchLureDataSchema
} from './lure.schemas.js'
import { LURE_SERVICE, type LureService } from './lure.service.js'

export const LURE_CONTROLLER = Symbol('LureController')

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
    super(validator, logger, router)

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
    this.validateApiCallData<CreateLureData>('console-create-lure-data', data)

    return await this.lureService.createLure(data)
  }

  private readLureApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ReadLureData>('console-read-lure-data', data)

    return await this.lureService.readLure(data)
  }

  private enableLureApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<SwitchLureData>('console-switch-lure-data', data)

    return await this.lureService.enableLure(data)
  }

  private disableLureApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<SwitchLureData>('console-switch-lure-data', data)

    return await this.lureService.disableLure(data)
  }

  private deleteLureApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<DeleteLureData>('console-delete-lure-data', data)

    return await this.lureService.deleteLure(data)
  }

  private listLuresApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ListLuresData>('console-list-lures-data', data)

    return await this.lureService.listLures(data)
  }
}
