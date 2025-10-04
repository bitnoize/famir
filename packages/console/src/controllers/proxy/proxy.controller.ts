import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  ProxyModel,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  Validator,
  VALIDATOR
} from '@famir/domain'
import {
  CREATE_PROXY_USE_CASE,
  CreateProxyUseCase,
  DELETE_PROXY_USE_CASE,
  DeleteProxyUseCase,
  DISABLE_PROXY_USE_CASE,
  DisableProxyUseCase,
  ENABLE_PROXY_USE_CASE,
  EnableProxyUseCase,
  LIST_PROXIES_USE_CASE,
  ListProxiesUseCase,
  READ_PROXY_USE_CASE,
  ReadProxyUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import {
  validateCreateProxyData,
  validateDeleteProxyData,
  validateListProxiesData,
  validateReadProxyData,
  validateSwitchProxyData
} from './proxy.utils.js'

export const PROXY_CONTROLLER = Symbol('ProxyController')

export class ProxyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyController>(
      PROXY_CONTROLLER,
      (c) =>
        new ProxyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<CreateProxyUseCase>(CREATE_PROXY_USE_CASE),
          c.resolve<ReadProxyUseCase>(READ_PROXY_USE_CASE),
          c.resolve<EnableProxyUseCase>(ENABLE_PROXY_USE_CASE),
          c.resolve<DisableProxyUseCase>(DISABLE_PROXY_USE_CASE),
          c.resolve<DeleteProxyUseCase>(DELETE_PROXY_USE_CASE),
          c.resolve<ListProxiesUseCase>(LIST_PROXIES_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): ProxyController {
    return container.resolve<ProxyController>(PROXY_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly createProxyUseCase: CreateProxyUseCase,
    protected readonly readProxyUseCase: ReadProxyUseCase,
    protected readonly enableProxyUseCase: EnableProxyUseCase,
    protected readonly disableProxyUseCase: DisableProxyUseCase,
    protected readonly deleteProxyUseCase: DeleteProxyUseCase,
    protected readonly listProxiesUseCase: ListProxiesUseCase
  ) {
    super(validator, logger, 'proxy')

    context.setHandler('createProxy', this.createProxyHandler)
    context.setHandler('readProxy', this.readProxyHandler)
    context.setHandler('enableProxy', this.enableProxyHandler)
    context.setHandler('disableProxy', this.disableProxyHandler)
    context.setHandler('deleteProxy', this.deleteProxyHandler)
    context.setHandler('listProxies', this.listProxiesHandler)
  }

  private readonly createProxyHandler = async (data: unknown): Promise<ProxyModel> => {
    try {
      validateCreateProxyData(this.assertSchema, data)

      return await this.createProxyUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'createProxy', data)
    }
  }

  private readonly readProxyHandler = async (data: unknown): Promise<ProxyModel | null> => {
    try {
      validateReadProxyData(this.assertSchema, data)

      return await this.readProxyUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'readProxy', data)
    }
  }

  private readonly enableProxyHandler = async (data: unknown): Promise<ProxyModel> => {
    try {
      validateSwitchProxyData(this.assertSchema, data)

      return await this.enableProxyUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'enableProxy', data)
    }
  }

  private readonly disableProxyHandler = async (data: unknown): Promise<ProxyModel> => {
    try {
      validateSwitchProxyData(this.assertSchema, data)

      return await this.disableProxyUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'disableProxy', data)
    }
  }

  private readonly deleteProxyHandler = async (data: unknown): Promise<ProxyModel> => {
    try {
      validateDeleteProxyData(this.assertSchema, data)

      return await this.deleteProxyUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'deleteProxy', data)
    }
  }

  private readonly listProxiesHandler = async (data: unknown): Promise<ProxyModel[] | null> => {
    try {
      validateListProxiesData(this.assertSchema, data)

      return await this.listProxiesUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'listProxies', data)
    }
  }
}
