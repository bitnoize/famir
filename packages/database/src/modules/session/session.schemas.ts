import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  randomIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawSession } from './session.functions.js'
import { UpgradeSessionParams } from './session.models.js'

/**
 * Schema for validating upgrade session params.
 *
 * @category Session
 * @internal
 */
export const upgradeSessionParamsSchema: JSONSchemaType<UpgradeSessionParams> = {
  type: 'object',
  required: ['lure_id', 'session_id', 'secret', 'back_url'],
  properties: {
    lure_id: customIdentSchema,
    session_id: randomIdentSchema,
    secret: randomIdentSchema,
    back_url: {
      type: 'string',
      minLength: 1,
    },
  },
  additionalProperties: false,
} as const

/**
 * Schema for validating raw session data from Redis.
 *
 * @category Session
 * @internal
 */
const rawSessionSchema: JSONSchemaType<RawSession> = {
  type: 'object',
  required: [
    'campaign_id',
    'session_id',
    'proxy_id',
    'secret',
    'is_upgraded',
    'message_count',
    'created_at',
    'authorized_at',
  ],
  properties: {
    campaign_id: customIdentSchema,
    session_id: randomIdentSchema,
    proxy_id: customIdentSchema,
    secret: randomIdentSchema,
    is_upgraded: booleanSchema,
    message_count: counterSchema,
    created_at: timestampSchema,
    authorized_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Collection of all schemas used by the session module.
 *
 * @category Session
 * @internal
 */
export const sessionSchemas: ValidatorSchemas = {
  'database-raw-session': rawSessionSchema,
} as const
