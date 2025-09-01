import { Proxy } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import {
  CreateProxyUseCase,
  DeleteProxyUseCase,
  DisableProxyUseCase,
  EnableProxyUseCase,
  ListProxiesUseCase,
  ReadProxyUseCase
} from '../../use-cases/index.js'
import {
  validateCreateProxyDto,
  validateDeleteProxyDto,
  validateDisableProxyDto,
  validateEnableProxyDto,
  validateReadProxyDto
} from './proxy.utils.js'

export class ProxyController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    context: Context,
    protected readonly createProxyUseCase: CreateProxyUseCase,
    protected readonly readProxyUseCase: ReadProxyUseCase,
    protected readonly enableProxyUseCase: EnableProxyUseCase,
    protected readonly disableProxyUseCase: DisableProxyUseCase,
    protected readonly deleteProxyUseCase: DeleteProxyUseCase,
    protected readonly listProxiesUseCase: ListProxiesUseCase
  ) {
    this.assertSchema = validator.assertSchema

    context.setHandler('createProxy', `Create proxy`, this.createHandler)
    context.setHandler('readProxy', `Read proxy`, this.createHandler)
    context.setHandler('enableProxy', `Enable proxy`, this.enableHandler)
    context.setHandler('disableProxy', `Disable proxy`, this.disableHandler)
    context.setHandler('deleteProxy', `Delete proxy`, this.deleteHandler)
    context.setHandler('listProxies', `List proxies`, this.listHandler)
  }

  private readonly createHandler = async (dto: unknown): Promise<true> => {
    validateCreateProxyDto(this.assertSchema, dto)

    return await this.createProxyUseCase.execute(dto)
  }

  private readonly readHandler = async (dto: unknown): Promise<Proxy | null> => {
    validateReadProxyDto(this.assertSchema, dto)

    return await this.readProxyUseCase.execute(dto)
  }

  private readonly enableHandler = async (dto: unknown): Promise<true> => {
    validateEnableProxyDto(this.assertSchema, dto)

    return await this.enableProxyUseCase.execute(dto)
  }

  private readonly disableHandler = async (dto: unknown): Promise<true> => {
    validateDisableProxyDto(this.assertSchema, dto)

    return await this.disableProxyUseCase.execute(dto)
  }

  private readonly deleteHandler = async (dto: unknown): Promise<true> => {
    validateDeleteProxyDto(this.assertSchema, dto)

    return await this.deleteProxyUseCase.execute(dto)
  }

  private readonly listHandler = async (): Promise<Proxy[] | null> => {
    return await this.listProxiesUseCase.execute()
  }
}
