import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import { ReadSessionData } from './session.js'

/**
 * @category Session
 * @internal
 */
const readSessionDataSchema: JSONSchemaType<ReadSessionData> = {
  type: 'object',
  required: ['campaignId', 'sessionId'],
  properties: {
    campaignId: customIdentSchema,
    sessionId: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Session
 * @internal
 */
export const sessionSchemas: ValidatorSchemas = {
  'console-read-session-data': readSessionDataSchema,
} as const
