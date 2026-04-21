import { ConsumeError, ConsumeRouter } from '@famir/consume'
import { Logger } from '@famir/logger'
import { AnalyzeJobData } from '@famir/produce'
import { Validator } from '@famir/validator'

/**
 * Base controller
 * @category none
 */
export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ConsumeRouter
  ) {}

  protected validateAnalyzeJobData(value: unknown): asserts value is AnalyzeJobData {
    try {
      this.validator.assertSchema<AnalyzeJobData>('consume-analyze-job-data', value)
    } catch (error) {
      throw new ConsumeError(`AnalyzeJobData validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }
}
