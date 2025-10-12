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
        controller: this.controllerName
      },
      `Controller initialized`
    )
  }

  protected exceptionWrapper(error: unknown, handler: string): never {
    if (error instanceof ExecutorError) {
      error.context['controller'] = this.controllerName
      error.context['handler'] = handler

      throw error
    } else {
      throw new ExecutorError(`Controller unhandled error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          handler,
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
