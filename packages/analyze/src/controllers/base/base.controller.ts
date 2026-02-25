import { ExecutorError, ExecutorRouter } from '@famir/executor'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { AnalyzeJobData } from '@famir/workflow'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ExecutorRouter
  ) {}

  protected validateAnalyzeJobData(value: unknown): asserts value is AnalyzeJobData {
    try {
      this.validator.assertSchema<AnalyzeJobData>('executor-analyze-job-data', value)
    } catch (error) {
      throw new ExecutorError(`AnalyzeJobData validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
