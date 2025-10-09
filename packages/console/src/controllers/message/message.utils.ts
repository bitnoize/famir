import { readMessageModelSchema } from '@famir/database'
import {
  ReadMessageModel,
  ReplServerError,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'read-message-model': readMessageModelSchema
}
export function validateReadMessageModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadMessageModel {
  try {
    assertSchema<ReadMessageModel>('read-message-model', data)
  } catch (error) {
    throw new ReplServerError(`ReadMessageModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
