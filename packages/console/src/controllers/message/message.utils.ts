import { ReadMessageData, ReplServerError, ValidatorAssertSchema } from '@famir/domain'

export function validateReadMessageData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadMessageData {
  try {
    assertSchema<ReadMessageData>('read-message-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadMessageData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
