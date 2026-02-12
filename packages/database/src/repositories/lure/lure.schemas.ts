import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/validator'
import { RawLure } from './lure.functions.js'

const rawLureSchema: JSONSchemaType<RawLure> = {
  type: 'object',
  required: [
    'campaign_id',
    'lure_id',
    'path',
    'redirector_id',
    'is_enabled',
    'session_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    lure_id: {
      type: 'string'
    },
    path: {
      type: 'string'
    },
    redirector_id: {
      type: 'string'
    },
    is_enabled: {
      type: 'integer'
    },
    session_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const lureSchemas: ValidatorSchemas = {
  'database-raw-lure': rawLureSchema
} as const

export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const
