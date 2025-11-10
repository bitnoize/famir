import {
  HttpServerError,
  Logger,
  Templater,
  Validator,
  ValidatorAssertSchema,
  ValidatorGuardSchema
} from '@famir/domain'

export abstract class BaseController {
  protected readonly guardSchema: ValidatorGuardSchema
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly controllerName: string
  ) {
    this.guardSchema = validator.guardSchema
    this.assertSchema = validator.assertSchema
  }

  protected handleException(error: unknown, step: string): never {
    if (error instanceof HttpServerError) {
      error.context['controller'] = this.controllerName
      error.context['step'] = step

      throw error
    } else {
      throw new HttpServerError(`Controller internal error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          step
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
