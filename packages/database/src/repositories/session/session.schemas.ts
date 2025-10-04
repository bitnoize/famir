import { JSONSchemaType } from '@famir/common'
import { ReadSessionData } from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const readSessionDataSchema: JSONSchemaType<ReadSessionData> = {
  type: 'object',
  required: ['campaignId', 'sessionId'],
  properties: {
    campaignId: customIdentSchema,
    sessionId: customIdentSchema
  },
  additionalProperties: false
} as const
