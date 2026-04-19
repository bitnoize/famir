import { ConsumeError, ConsumeRouter } from '@famir/consume'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'

/**
 * Represents a base controller
 *
 * @category none
 */
export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ConsumeRouter
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateData<T>(schema: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schema, value)
    } catch (error) {
      throw new ConsumeError(`Data validate failed`, {
        cause: error,
        code: 'BAD_REQUEST',
      })
    }
  }
}
