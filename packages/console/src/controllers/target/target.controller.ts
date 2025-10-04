import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  TargetModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import {
  CREATE_TARGET_USE_CASE,
  CreateTargetUseCase,
  DELETE_TARGET_USE_CASE,
  DeleteTargetUseCase,
  DISABLE_TARGET_USE_CASE,
  DisableTargetUseCase,
  ENABLE_TARGET_USE_CASE,
  EnableTargetUseCase,
  LIST_TARGETS_USE_CASE,
  ListTargetsUseCase,
  READ_TARGET_USE_CASE,
  ReadTargetUseCase,
  UPDATE_TARGET_USE_CASE,
  UpdateTargetUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import {
  validateCreateTargetData,
  validateDeleteTargetData,
  validateListTargetsData,
  validateReadTargetData,
  validateSwitchTargetData,
  validateUpdateTargetData
} from './target.utils.js'

export const TARGET_CONTROLLER = Symbol('TargetController')

export class TargetController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetController>(
      TARGET_CONTROLLER,
      (c) =>
        new TargetController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<CreateTargetUseCase>(CREATE_TARGET_USE_CASE),
          c.resolve<ReadTargetUseCase>(READ_TARGET_USE_CASE),
          c.resolve<UpdateTargetUseCase>(UPDATE_TARGET_USE_CASE),
          c.resolve<EnableTargetUseCase>(ENABLE_TARGET_USE_CASE),
          c.resolve<DisableTargetUseCase>(DISABLE_TARGET_USE_CASE),
          c.resolve<DeleteTargetUseCase>(DELETE_TARGET_USE_CASE),
          c.resolve<ListTargetsUseCase>(LIST_TARGETS_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): TargetController {
    return container.resolve<TargetController>(TARGET_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly createTargetUseCase: CreateTargetUseCase,
    protected readonly readTargetUseCase: ReadTargetUseCase,
    protected readonly updateTargetUseCase: UpdateTargetUseCase,
    protected readonly enableTargetUseCase: EnableTargetUseCase,
    protected readonly disableTargetUseCase: DisableTargetUseCase,
    protected readonly deleteTargetUseCase: DeleteTargetUseCase,
    protected readonly listTargetsUseCase: ListTargetsUseCase
  ) {
    super(validator, logger, 'target')

    context.setHandler('createTarget', this.createTargetHandler)
    context.setHandler('readTarget', this.readTargetHandler)
    context.setHandler('updateTarget', this.updateTargetHandler)
    context.setHandler('enableTarget', this.enableTargetHandler)
    context.setHandler('disableTarget', this.disableTargetHandler)
    context.setHandler('deleteTarget', this.deleteTargetHandler)
    context.setHandler('listTargets', this.listTargetsHandler)
  }

  private readonly createTargetHandler = async (data: unknown): Promise<TargetModel> => {
    try {
      validateCreateTargetData(this.assertSchema, data)

      return await this.createTargetUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'createTarget', data)
    }
  }

  private readonly readTargetHandler = async (data: unknown): Promise<TargetModel | null> => {
    try {
      validateReadTargetData(this.assertSchema, data)

      return await this.readTargetUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'readTarget', data)
    }
  }

  private readonly updateTargetHandler = async (data: unknown): Promise<TargetModel> => {
    try {
      validateUpdateTargetData(this.assertSchema, data)

      return await this.updateTargetUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'updateTarget', data)
    }
  }

  private readonly enableTargetHandler = async (data: unknown): Promise<TargetModel> => {
    try {
      validateSwitchTargetData(this.assertSchema, data)

      return await this.enableTargetUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'enableTarget', data)
    }
  }

  private readonly disableTargetHandler = async (data: unknown): Promise<TargetModel> => {
    try {
      validateSwitchTargetData(this.assertSchema, data)

      return await this.disableTargetUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'disableTarget', data)
    }
  }

  private readonly deleteTargetHandler = async (data: unknown): Promise<TargetModel> => {
    try {
      validateDeleteTargetData(this.assertSchema, data)

      return await this.deleteTargetUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'deleteTarget', data)
    }
  }

  private readonly listTargetsHandler = async (data: unknown): Promise<TargetModel[] | null> => {
    try {
      validateListTargetsData(this.assertSchema, data)

      return await this.listTargetsUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'listTargets', data)
    }
  }
}
