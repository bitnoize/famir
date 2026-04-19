import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { RedirectorParams } from '../../models/index.js'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'

/**
 * @category Schemas
 * @internal
 */
const rawRedirectorSchema: JSONSchemaType<RawRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'lure_count', 'created_at'],
  properties: {
    campaign_id: {
      type: 'string',
    },
    redirector_id: {
      type: 'string',
    },
    lure_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Schemas
 * @internal
 */
const rawFullRedirectorSchema: JSONSchemaType<RawFullRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'page', 'fields', 'lure_count', 'created_at'],
  properties: {
    campaign_id: {
      type: 'string',
    },
    redirector_id: {
      type: 'string',
    },
    page: {
      type: 'string',
    },
    fields: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    lure_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Schemas
 * @internal
 */
export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760,
} as const

/**
 * @category Schemas
 * @internal
 */
export const redirectorFieldSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
}

/**
 * @category Schemas
 * @internal
 */
export const redirectorFieldsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: redirectorFieldSchema,
} as const

/**
 * @category Schemas
 * @internal
 */
export const redirectorParamsSchema: JSONSchemaType<RedirectorParams> = {
  type: 'object',
  required: [],
  additionalProperties: {
    type: 'string',
    minLength: 1,
  },
} as const

/**
 * @category Utils
 * @internal
 */
export const redirectorSchemas: ValidatorSchemas = {
  'database-raw-redirector': rawRedirectorSchema,
  'database-raw-full-redirector': rawFullRedirectorSchema,
} as const
