import { Proxy } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context, ReplServerError } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import {
  CreateProxyUseCase,
  DeleteProxyUseCase,
  DisableProxyUseCase,
  EnableProxyUseCase,
  ListProxiesUseCase,
  ReadProxyUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/base.controller.js'
import {
  validateCreateProxyDto,
  validateDeleteProxyDto,
  validateDisableProxyDto,
  validateEnableProxyDto,
  validateReadProxyDto
} from './proxy.utils.js'

export class ProxyController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    context: Context,
    protected readonly createProxyUseCase: CreateProxyUseCase,
    protected readonly readProxyUseCase: ReadProxyUseCase,
    protected readonly enableProxyUseCase: EnableProxyUseCase,
    protected readonly disableProxyUseCase: DisableProxyUseCase,
    protected readonly deleteProxyUseCase: DeleteProxyUseCase,
    protected readonly listProxiesUseCase: ListProxiesUseCase
  ) {
    super(validator, logger, context, 'proxy')

    this.context.addValue(this.controllerName, {
      create: this.createHandler,
      read: this.readHandler,
      enable: this.enableHandler,
      disable: this.disableHandler,
      delete: this.deleteHandler,
      list: this.listHandler
    })
  }

  private readonly createHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateCreateProxyDto(this.assertSchema, dto)

      return await this.createProxyUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'create', dto)
    }
  }

  private readonly readHandler = async (dto: unknown): Promise<Proxy | null | ReplServerError> => {
    try {
      validateReadProxyDto(this.assertSchema, dto)

      return await this.readProxyUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'read', dto)
    }
  }

  private readonly enableHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateEnableProxyDto(this.assertSchema, dto)

      return await this.enableProxyUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'enable', dto)
    }
  }

  private readonly disableHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateDisableProxyDto(this.assertSchema, dto)

      return await this.disableProxyUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'disable', dto)
    }
  }

  private readonly deleteHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateDeleteProxyDto(this.assertSchema, dto)

      return await this.deleteProxyUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'delete', dto)
    }
  }

  private readonly listHandler = async (): Promise<Proxy[] | null | ReplServerError> => {
    try {
      return await this.listProxiesUseCase.execute()
    } catch (error) {
      return this.exceptionFilter(error, 'list', undefined)
    }
  }
}
