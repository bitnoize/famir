import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
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
import { lureSchemas } from './lure.schemas.js'
import { LURE_SERVICE, type LureService } from './lure.service.js'

export const LURE_CONTROLLER = Symbol('LureController')

export class LureController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
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
    return container.resolve(LURE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly lureService: LureService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(lureSchemas)

    this.logger.debug(`LureController initialized`)
  }

  register(): this {
    this.router
      .register('createLure', this.createLureApiCall)
      .register('readLure', this.readLureApiCall)
      .register('enableLure', this.enableLureApiCall)
      .register('disableLure', this.disableLureApiCall)
      .register('deleteLure', this.deleteLureApiCall)
      .register('listLures', this.listLuresApiCall)

    return this
  }

  private createLureApiCall: ReplServerApiCall = async (data) => {
    this.validateData<CreateLureData>('console-create-lure-data', data)

    await this.lureService.create(data)

    return true
  }

  private readLureApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ReadLureData>('console-read-lure-data', data)

    return await this.lureService.read(data)
  }

  private enableLureApiCall: ReplServerApiCall = async (data) => {
    this.validateData<SwitchLureData>('console-switch-lure-data', data)

    await this.lureService.enable(data)

    return true
  }

  private disableLureApiCall: ReplServerApiCall = async (data) => {
    this.validateData<SwitchLureData>('console-switch-lure-data', data)

    await this.lureService.disable(data)

    return true
  }

  private deleteLureApiCall: ReplServerApiCall = async (data) => {
    this.validateData<DeleteLureData>('console-delete-lure-data', data)

    await this.lureService.delete(data)

    return true
  }

  private listLuresApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ListLuresData>('console-list-lures-data', data)

    return await this.lureService.list(data)
  }
}
