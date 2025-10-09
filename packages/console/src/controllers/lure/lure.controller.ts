import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  LureModel,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateLureModel,
  validateDeleteLureModel,
  validateListLureModels,
  validateReadLureModel,
  validateSwitchLureModel
} from './lure.utils.js'
import {
  CREATE_LURE_USE_CASE,
  CreateLureUseCase,
  DELETE_LURE_USE_CASE,
  DeleteLureUseCase,
  DISABLE_LURE_USE_CASE,
  DisableLureUseCase,
  ENABLE_LURE_USE_CASE,
  EnableLureUseCase,
  LIST_LURES_USE_CASE,
  ListLuresUseCase,
  READ_LURE_USE_CASE,
  ReadLureUseCase
} from './use-cases/index.js'

export const LURE_CONTROLLER = Symbol('LureController')

export class LureController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<LureController>(
      LURE_CONTROLLER,
      (c) =>
        new LureController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<CreateLureUseCase>(CREATE_LURE_USE_CASE),
          c.resolve<ReadLureUseCase>(READ_LURE_USE_CASE),
          c.resolve<EnableLureUseCase>(ENABLE_LURE_USE_CASE),
          c.resolve<DisableLureUseCase>(DISABLE_LURE_USE_CASE),
          c.resolve<DeleteLureUseCase>(DELETE_LURE_USE_CASE),
          c.resolve<ListLuresUseCase>(LIST_LURES_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): LureController {
    return container.resolve<LureController>(LURE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly createLureUseCase: CreateLureUseCase,
    protected readonly readLureUseCase: ReadLureUseCase,
    protected readonly enableLureUseCase: EnableLureUseCase,
    protected readonly disableLureUseCase: DisableLureUseCase,
    protected readonly deleteLureUseCase: DeleteLureUseCase,
    protected readonly listLuresUseCase: ListLuresUseCase
  ) {
    super(validator, logger, 'lure')

    validator.addSchemas(addSchemas)

    context.setHandler('createLure', this.createLureHandler)
    context.setHandler('readLure', this.readLureHandler)
    context.setHandler('enableLure', this.enableLureHandler)
    context.setHandler('disableLure', this.disableLureHandler)
    context.setHandler('deleteLure', this.deleteLureHandler)
    context.setHandler('listLures', this.listLuresHandler)
  }

  private readonly createLureHandler = async (data: unknown): Promise<LureModel> => {
    try {
      validateCreateLureModel(this.assertSchema, data)

      return await this.createLureUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'createLure', data)
    }
  }

  private readonly readLureHandler = async (data: unknown): Promise<LureModel | null> => {
    try {
      validateReadLureModel(this.assertSchema, data)

      return await this.readLureUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'readLure', data)
    }
  }

  private readonly enableLureHandler = async (data: unknown): Promise<LureModel> => {
    try {
      validateSwitchLureModel(this.assertSchema, data)

      return await this.enableLureUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'enableLure', data)
    }
  }

  private readonly disableLureHandler = async (data: unknown): Promise<LureModel> => {
    try {
      validateSwitchLureModel(this.assertSchema, data)

      return await this.disableLureUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'disableLure', data)
    }
  }

  private readonly deleteLureHandler = async (data: unknown): Promise<LureModel> => {
    try {
      validateDeleteLureModel(this.assertSchema, data)

      return await this.deleteLureUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'deleteLure', data)
    }
  }

  private readonly listLuresHandler = async (data: unknown): Promise<LureModel[] | null> => {
    try {
      validateListLureModels(this.assertSchema, data)

      return await this.listLuresUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'listLures', data)
    }
  }
}
