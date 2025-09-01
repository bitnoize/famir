import { Target } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import {
  CreateTargetUseCase,
  DeleteTargetUseCase,
  DisableTargetUseCase,
  EnableTargetUseCase,
  ListTargetsUseCase,
  ReadTargetUseCase,
  UpdateTargetUseCase
} from '../../use-cases/index.js'
import {
  validateCreateTargetDto,
  validateDeleteTargetDto,
  validateDisableTargetDto,
  validateEnableTargetDto,
  validateReadTargetDto,
  validateUpdateTargetDto
} from './target.utils.js'

export class TargetController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    context: Context,
    protected readonly createTargetUseCase: CreateTargetUseCase,
    protected readonly readTargetUseCase: ReadTargetUseCase,
    protected readonly updateTargetUseCase: UpdateTargetUseCase,
    protected readonly enableTargetUseCase: EnableTargetUseCase,
    protected readonly disableTargetUseCase: DisableTargetUseCase,
    protected readonly deleteTargetUseCase: DeleteTargetUseCase,
    protected readonly listTargetsUseCase: ListTargetsUseCase
  ) {
    this.assertSchema = validator.assertSchema

    context.setHandler('createTarget', `Create target`, this.createHandler)
    context.setHandler('readTarget', `Read target`, this.readHandler)
    context.setHandler('updateTarget', `Update target`, this.updateHandler)
    context.setHandler('enableTarget', `Enable target`, this.enableHandler)
    context.setHandler('disableTarget', `Disable target`, this.disableHandler)
    context.setHandler('deleteTarget', `Delete target`, this.deleteHandler)
    context.setHandler('listTargets', `List targets`, this.listHandler)
  }

  private readonly createHandler = async (dto: unknown): Promise<true> => {
    validateCreateTargetDto(this.assertSchema, dto)

    return await this.createTargetUseCase.execute(dto)
  }

  private readonly readHandler = async (dto: unknown): Promise<Target | null> => {
    validateReadTargetDto(this.assertSchema, dto)

    return await this.readTargetUseCase.execute(dto)
  }

  private readonly updateHandler = async (dto: unknown): Promise<true> => {
    validateUpdateTargetDto(this.assertSchema, dto)

    return await this.updateTargetUseCase.execute(dto)
  }

  private readonly enableHandler = async (dto: unknown): Promise<true> => {
    validateEnableTargetDto(this.assertSchema, dto)

    return await this.enableTargetUseCase.execute(dto)
  }

  private readonly disableHandler = async (dto: unknown): Promise<true> => {
    validateDisableTargetDto(this.assertSchema, dto)

    return await this.disableTargetUseCase.execute(dto)
  }

  private readonly deleteHandler = async (dto: unknown): Promise<true> => {
    validateDeleteTargetDto(this.assertSchema, dto)

    return await this.deleteTargetUseCase.execute(dto)
  }

  private readonly listHandler = async (): Promise<Target[] | null> => {
    return await this.listTargetsUseCase.execute()
  }
}
