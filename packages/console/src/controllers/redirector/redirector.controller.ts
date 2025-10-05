import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  RedirectorModel,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateRedirectorData,
  validateDeleteRedirectorData,
  validateListRedirectorsData,
  validateReadRedirectorData,
  validateUpdateRedirectorData
} from './redirector.utils.js'
import {
  CREATE_REDIRECTOR_USE_CASE,
  CreateRedirectorUseCase,
  DELETE_REDIRECTOR_USE_CASE,
  DeleteRedirectorUseCase,
  LIST_REDIRECTORS_USE_CASE,
  ListRedirectorsUseCase,
  READ_REDIRECTOR_USE_CASE,
  ReadRedirectorUseCase,
  UPDATE_REDIRECTOR_USE_CASE,
  UpdateRedirectorUseCase
} from './use-cases/index.js'

export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

export class RedirectorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorController>(
      REDIRECTOR_CONTROLLER,
      (c) =>
        new RedirectorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<CreateRedirectorUseCase>(CREATE_REDIRECTOR_USE_CASE),
          c.resolve<ReadRedirectorUseCase>(READ_REDIRECTOR_USE_CASE),
          c.resolve<UpdateRedirectorUseCase>(UPDATE_REDIRECTOR_USE_CASE),
          c.resolve<DeleteRedirectorUseCase>(DELETE_REDIRECTOR_USE_CASE),
          c.resolve<ListRedirectorsUseCase>(LIST_REDIRECTORS_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): RedirectorController {
    return container.resolve<RedirectorController>(REDIRECTOR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly createRedirectorUseCase: CreateRedirectorUseCase,
    protected readonly readRedirectorUseCase: ReadRedirectorUseCase,
    protected readonly updateRedirectorUseCase: UpdateRedirectorUseCase,
    protected readonly deleteRedirectorUseCase: DeleteRedirectorUseCase,
    protected readonly listRedirectorsUseCase: ListRedirectorsUseCase
  ) {
    super(validator, logger, 'redirector')

    validator.addSchemas(addSchemas)

    context.setHandler('createRedirector', this.createRedirectorHandler)
    context.setHandler('readRedirector', this.readRedirectorHandler)
    context.setHandler('updateRedirector', this.updateRedirectorHandler)
    context.setHandler('deleteRedirector', this.deleteRedirectorHandler)
    context.setHandler('listRedirectors', this.listRedirectorsHandler)
  }

  private readonly createRedirectorHandler = async (data: unknown): Promise<RedirectorModel> => {
    try {
      validateCreateRedirectorData(this.assertSchema, data)

      return await this.createRedirectorUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'createRedirector', data)
    }
  }

  private readonly readRedirectorHandler = async (
    data: unknown
  ): Promise<RedirectorModel | null> => {
    try {
      validateReadRedirectorData(this.assertSchema, data)

      return await this.readRedirectorUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'readRedirector', data)
    }
  }

  private readonly updateRedirectorHandler = async (data: unknown): Promise<RedirectorModel> => {
    try {
      validateUpdateRedirectorData(this.assertSchema, data)

      return await this.updateRedirectorUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'updateRedirector', data)
    }
  }

  private readonly deleteRedirectorHandler = async (data: unknown): Promise<RedirectorModel> => {
    try {
      validateDeleteRedirectorData(this.assertSchema, data)

      return await this.deleteRedirectorUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'deleteRedirector', data)
    }
  }

  private readonly listRedirectorsHandler = async (
    data: unknown
  ): Promise<RedirectorModel[] | null> => {
    try {
      validateListRedirectorsData(this.assertSchema, data)

      return await this.listRedirectorsUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'listRedirectors', data)
    }
  }
}
