import {
  AnalyzeLogJobData,
  ExecutorError,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'
import { analyzeLogJobDataSchema } from './analyze-log.schemas.js'

export const internalSchemas: ValidatorSchemas = {
  'analyze-log-job-data': analyzeLogJobDataSchema
}

export function validateAnalyzeLogJobData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is AnalyzeLogJobData {
  try {
    assertSchema<AnalyzeLogJobData>('analyze-log-job-data', data)
  } catch (error) {
    throw new ExecutorError(`AnalyzeLogJobData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
