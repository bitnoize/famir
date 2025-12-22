import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { ReadSessionData } from './session.js'

export const readSessionDataSchema: JSONSchemaType<ReadSessionData> = {
  type: 'object',
  required: ['campaignId', 'sessionId'],
  properties: {
    campaignId: customIdentSchema,
    sessionId: randomIdentSchema
  },
  additionalProperties: false
} as const
