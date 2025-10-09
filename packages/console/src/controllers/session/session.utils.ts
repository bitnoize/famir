import { readSessionModelSchema } from '@famir/database'
import {
  ReadSessionModel,
  ReplServerError,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'read-session-model': readSessionModelSchema
}
export function validateReadSessionModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadSessionModel {
  try {
    assertSchema<ReadSessionModel>('read-session-model', data)
  } catch (error) {
    throw new ReplServerError(`ReadSessionModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
