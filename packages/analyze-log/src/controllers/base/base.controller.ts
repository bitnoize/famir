import { ExecutorError, Logger, Validator, ValidatorAssertSchema } from '@famir/domain'

export abstract class BaseController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly controllerName: string
  ) {
    this.assertSchema = validator.assertSchema
  }

  protected handleException(error: unknown, processor: string, data: unknown): never {
    if (error instanceof ExecutorError) {
      error.context['controller'] = this.controllerName
      error.context['processor'] = processor

      throw error
    } else {
      throw new ExecutorError(`Controller unknown error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          processor
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
