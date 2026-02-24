import { ExecutorError, ExecutorRouter } from '@famir/executor'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { AnalyzeLogJobData } from '@famir/workflow'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ExecutorRouter
  ) {}

  protected validateAnalyzeLogJobData(value: unknown): asserts value is AnalyzeLogJobData {
    try {
      this.validator.assertSchema<AnalyzeLogJobData>('executor-analyze-log-job-data', value)
    } catch (error) {
      throw new ExecutorError(`AnalyzeLogJobData validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
