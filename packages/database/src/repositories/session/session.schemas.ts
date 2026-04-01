import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { RawSession } from './session.functions.js'

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
    'authorized_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    session_id: {
      type: 'string'
    },
    proxy_id: {
      type: 'string'
    },
    secret: {
      type: 'string'
    },
    is_upgraded: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    authorized_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const sessionSchemas: ValidatorSchemas = {
  'database-raw-session': rawSessionSchema
} as const
