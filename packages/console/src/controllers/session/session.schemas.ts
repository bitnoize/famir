import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { ReadSessionData } from './session.js'

const readSessionDataSchema: JSONSchemaType<ReadSessionData> = {
  type: 'object',
  required: ['campaignId', 'sessionId'],
  properties: {
    campaignId: customIdentSchema,
    sessionId: randomIdentSchema
  },
  additionalProperties: false
} as const

export const sessionSchemas: ValidatorSchemas = {
  'console-read-session-data': readSessionDataSchema
} as const
