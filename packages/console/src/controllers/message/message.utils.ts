import { readMessageDataSchema } from '@famir/database'
import {
  ReadMessageData,
  ReplServerError,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'read-message-data': readMessageDataSchema
}
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
