import { ReadSessionData, ReplServerError, ValidatorAssertSchema } from '@famir/domain'

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
