import { JSONSchemaType } from '@famir/common'
import { ReadSessionModel } from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const readSessionModelSchema: JSONSchemaType<ReadSessionModel> = {
  type: 'object',
  required: ['campaignId', 'sessionId'],
  properties: {
    campaignId: customIdentSchema,
    sessionId: customIdentSchema
  },
  additionalProperties: false
} as const
