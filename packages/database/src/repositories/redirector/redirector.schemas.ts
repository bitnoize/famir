import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'

const rawRedirectorSchema: JSONSchemaType<RawRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'lure_count', 'created_at', 'updated_at'],
  properties: {
    campaign_id: {
      type: 'string'
    },
    redirector_id: {
      type: 'string'
    },
    lure_count: {
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

const rawFullRedirectorSchema: JSONSchemaType<RawFullRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'page', 'lure_count', 'created_at', 'updated_at'],
  properties: {
    campaign_id: {
      type: 'string'
    },
    redirector_id: {
      type: 'string'
    },
    page: {
      type: 'string'
    },
    lure_count: {
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

export const redirectorSchemas: ValidatorSchemas = {
  'database-raw-redirector': rawRedirectorSchema,
  'database-raw-full-redirector': rawFullRedirectorSchema
} as const

export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const
