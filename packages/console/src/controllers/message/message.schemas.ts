import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { ReadMessageData } from './message.js'

export const readMessageDataSchema: JSONSchemaType<ReadMessageData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const
