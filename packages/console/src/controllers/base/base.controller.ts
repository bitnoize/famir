import { Logger, ReplServerError, Validator, ValidatorAssertSchema } from '@famir/domain'

export abstract class BaseController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly controllerName: string
  ) {
    this.assertSchema = validator.assertSchema
  }

  protected handleException(error: unknown, apiCall: string, data: unknown): never {
    if (error instanceof ReplServerError) {
      error.context['controller'] = this.controllerName
      error.context['apiCall'] = apiCall
      error.context['data'] = data

      throw error
    } else {
      throw new ReplServerError(`Controller internal error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          apiCall,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
