import { HttpServerError, Logger, Templater, Validator } from '@famir/domain'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly controllerName: string
  ) {}

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
