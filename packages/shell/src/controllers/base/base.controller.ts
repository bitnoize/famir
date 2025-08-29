import { Logger } from '@famir/logger'
import { Context, ReplServerError } from '@famir/repl-server'
import { Validator, ValidatorAssertSchema } from '@famir/validator'

export abstract class BaseController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly context: Context,
    protected readonly controllerName: string
  ) {
    this.assertSchema = validator.assertSchema
  }

  protected exceptionFilter(error: unknown, method: string, dto: unknown): ReplServerError {
    if (error instanceof ReplServerError) {
      error.context['controller'] = this.controllerName
      error.context['method'] = method
      error.context['dto'] = dto

      return error
    } else {
      return new ReplServerError(
        'UNKNOWN_ERROR',
        {
          controller: this.controllerName,
          method,
          dto,
          cause: error
        },
        `Shell unknown error`
      )
    }
  }
}
