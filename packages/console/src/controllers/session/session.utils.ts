import { readSessionDataSchema } from '@famir/database'
import {
  ReadSessionData,
  ReplServerError,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'read-session-data': readSessionDataSchema
}
export function validateReadSessionData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadSessionData {
  try {
    assertSchema<ReadSessionData>('read-session-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadSessionData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
