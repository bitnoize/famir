import { ExecutorError, Logger, Validator, ValidatorAssertSchema } from '@famir/domain'

export abstract class BaseController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly controllerName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.logger.debug(
      {
        module: 'persist-log',
        controller: this.controllerName
      },
      `Controller initialized`
    )
  }

  protected exceptionFilter(error: unknown, handler: string, data: unknown): never {
    if (error instanceof ExecutorError) {
      error.context['module'] = 'persist-log'
      error.context['controller'] = this.controllerName
      error.context['handler'] = handler
      error.context['data'] = data

      throw error
    } else {
      throw new ExecutorError(`Controller internal error`, {
        cause: error,
        context: {
          module: 'persist-log',
          controller: this.controllerName,
          handler,
          data
        },
        code: 'UNKNOWN'
      })
    }
  }
}
