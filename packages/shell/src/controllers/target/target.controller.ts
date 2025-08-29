import { Target } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context, ReplServerError } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import {
  CreateTargetUseCase,
  DeleteTargetUseCase,
  DisableTargetUseCase,
  EnableTargetUseCase,
  ListTargetsUseCase,
  ReadTargetUseCase,
  UpdateTargetUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/base.controller.js'
import {
  validateCreateTargetDto,
  validateDeleteTargetDto,
  validateDisableTargetDto,
  validateEnableTargetDto,
  validateReadTargetDto,
  validateUpdateTargetDto
} from './target.utils.js'

export class TargetController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    context: Context,
    protected readonly createTargetUseCase: CreateTargetUseCase,
    protected readonly readTargetUseCase: ReadTargetUseCase,
    protected readonly updateTargetUseCase: UpdateTargetUseCase,
    protected readonly enableTargetUseCase: EnableTargetUseCase,
    protected readonly disableTargetUseCase: DisableTargetUseCase,
    protected readonly deleteTargetUseCase: DeleteTargetUseCase,
    protected readonly listTargetsUseCase: ListTargetsUseCase
  ) {
    super(validator, logger, context, 'target')

    this.context.addValue(this.controllerName, {
      create: this.createHandler,
      read: this.readHandler,
      update: this.updateHandler,
      enable: this.enableHandler,
      disable: this.disableHandler,
      delete: this.deleteHandler,
      list: this.listHandler
    })
  }

  private readonly createHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateCreateTargetDto(this.assertSchema, dto)

      return await this.createTargetUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'create', dto)
    }
  }

  private readonly readHandler = async (dto: unknown): Promise<Target | null | ReplServerError> => {
    try {
      validateReadTargetDto(this.assertSchema, dto)

      return await this.readTargetUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'read', dto)
    }
  }

  private readonly updateHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateUpdateTargetDto(this.assertSchema, dto)

      return await this.updateTargetUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'update', dto)
    }
  }

  private readonly enableHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateEnableTargetDto(this.assertSchema, dto)

      return await this.enableTargetUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'enable', dto)
    }
  }

  private readonly disableHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateDisableTargetDto(this.assertSchema, dto)

      return await this.disableTargetUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'disable', dto)
    }
  }

  private readonly deleteHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateDeleteTargetDto(this.assertSchema, dto)

      return await this.deleteTargetUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'delete', dto)
    }
  }

  private readonly listHandler = async (): Promise<Target[] | null | ReplServerError> => {
    try {
      return await this.listTargetsUseCase.execute()
    } catch (error) {
      return this.exceptionFilter(error, 'list', undefined)
    }
  }
}
