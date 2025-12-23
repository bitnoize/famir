import { Logger, ReplServerError, ReplServerRouter, Validator } from '@famir/domain'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {}

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
}
