import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { ValidatorSchemas } from '@famir/validator'
import { ReadMessageData } from './message.js'

const readMessageDataSchema: JSONSchemaType<ReadMessageData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const

export const messageSchemas: ValidatorSchemas = {
  'console-read-message-data': readMessageDataSchema
} as const
