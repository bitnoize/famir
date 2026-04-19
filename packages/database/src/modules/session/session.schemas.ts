import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import { RawSession } from './session.functions.js'
import { UpgradeSessionParams } from './session.models.js'

/**
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
    campaign_id: {
      type: 'string',
    },
    session_id: {
      type: 'string',
    },
    proxy_id: {
      type: 'string',
    },
    secret: {
      type: 'string',
    },
    is_upgraded: {
      type: 'integer',
    },
    message_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
    authorized_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
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
 * @category Session
 * @internal
 */
export const sessionSchemas: ValidatorSchemas = {
  'database-raw-session': rawSessionSchema,
} as const
