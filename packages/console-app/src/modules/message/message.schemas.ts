import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import { ReadMessageData } from './message.js'

/**
 * @category Message
 * @internal
 */
const readMessageDataSchema: JSONSchemaType<ReadMessageData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Message
 * @internal
 */
export const messageSchemas: ValidatorSchemas = {
  'console-read-message-data': readMessageDataSchema,
} as const
