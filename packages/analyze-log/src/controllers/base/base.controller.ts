import { AnalyzeLogJobData } from '@famir/domain'
import { ExecutorError } from '@famir/executor'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly controllerName: string
  ) {}

  protected validateAnalyzeLogJobData(value: unknown): asserts value is AnalyzeLogJobData {
    try {
      this.validator.assertSchema<AnalyzeLogJobData>('analyze-log-job-data', value)
    } catch (error) {
      throw new ExecutorError(`AnalyzeLogJobData validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected handleException(error: unknown, processor: string, data: unknown): never {
    if (error instanceof ExecutorError) {
      error.context['controller'] = this.controllerName
      error.context['processor'] = processor
      error.context['data'] = data

      throw error
    } else {
      throw new ExecutorError(`Controller internal error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          processor,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
