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

    this.validator.addSchemas(lureSchemas)

    this.router.register('createLure', this.createLure)
    this.router.register('readLure', this.readLure)
    this.router.register('enableLure', this.enableLure)
    this.router.register('disableLure', this.disableLure)
    this.router.register('deleteLure', this.deleteLure)
    this.router.register('listLures', this.listLures)

    this.logger.debug(`LureController initialized`)
  }

  private createLure: ReplServerApiCall = async (data) => {
    this.validateData<CreateLureData>('console-create-lure-data', data)

    await this.lureService.create(data)

    return true
  }

  private readLure: ReplServerApiCall = async (data) => {
    this.validateData<ReadLureData>('console-read-lure-data', data)

    return await this.lureService.read(data)
  }

  private enableLure: ReplServerApiCall = async (data) => {
    this.validateData<SwitchLureData>('console-switch-lure-data', data)

    await this.lureService.enable(data)

    return true
  }

  private disableLure: ReplServerApiCall = async (data) => {
    this.validateData<SwitchLureData>('console-switch-lure-data', data)

    await this.lureService.disable(data)

    return true
  }

  private deleteLure: ReplServerApiCall = async (data) => {
    this.validateData<DeleteLureData>('console-delete-lure-data', data)

    await this.lureService.delete(data)

    return true
  }

  private listLures: ReplServerApiCall = async (data) => {
    this.validateData<ListLuresData>('console-list-lures-data', data)

    return await this.lureService.list(data)
  }
}
