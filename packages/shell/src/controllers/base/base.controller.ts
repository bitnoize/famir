import {
  Logger,
  ReplServerContext,
  ReplServerError,
  Validator,
  ValidatorAssertSchema
} from '@famir/domain'

export abstract class BaseController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly context: ReplServerContext,
    protected readonly controllerName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.logger.debug(
      {
        module: 'shell',
        controller: this.controllerName
      },
      `Controller initialized`
    )
  }

  protected exceptionFilter(error: unknown, handler: string, data: unknown): never {
    if (error instanceof ReplServerError) {
      error.context['module'] = 'shell'
      error.context['controller'] = this.controllerName
      error.context['handler'] = handler
      error.context['data'] = data

      throw error
    } else {
      throw new ReplServerError(`Controller internal error`, {
        cause: error,
        context: {
          module: 'shell',
          controller: this.controllerName,
          handler,
          data
        },
        code: 'UNKNOWN'
      })
    }
  }
}
