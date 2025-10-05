import {
  ExecutorError,
  PersistLogJobData,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'
import { persistLogJobDataSchema } from '@famir/workflow'

export const addSchemas: ValidatorSchemas = {
  'persist-log-job-data': persistLogJobDataSchema
}

export function validatePersistLogJobData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is PersistLogJobData {
  try {
    assertSchema<PersistLogJobData>('persist-log-job-data', data)
  } catch (error) {
    throw new ExecutorError(`PersistLogJobData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
