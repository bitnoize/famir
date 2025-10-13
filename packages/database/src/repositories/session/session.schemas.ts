import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { ReadSessionModel } from '@famir/domain'

export const readSessionModelSchema: JSONSchemaType<ReadSessionModel> = {
  type: 'object',
  required: ['campaignId', 'sessionId'],
  properties: {
    campaignId: customIdentSchema,
    sessionId: randomIdentSchema
  },
  additionalProperties: false
} as const
