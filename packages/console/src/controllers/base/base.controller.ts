import { Logger, ReplServerError, ReplServerRouter, Validator } from '@famir/domain'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateData<T>(schema: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schema, value)
    } catch (error) {
      throw new ReplServerError(`Data validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}
