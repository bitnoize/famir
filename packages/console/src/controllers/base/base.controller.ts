import { Logger, ReplServerError, ReplServerRouter, Validator } from '@famir/domain'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {}

  protected validateApiCallData<T>(value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schema, value)
    } catch (error) {
      throw new ReplServerError(`ApiCall data validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  /*
  protected handleException(error: unknown, apiCall: string, data: unknown): never {
    if (error instanceof ReplServerError) {
      error.context['apiCall'] = apiCall
      error.context['data'] = data

      throw error
    } else {
      throw new ReplServerError(`Server internal error`, {
        cause: error,
        context: {
          apiCall,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
  */
}
