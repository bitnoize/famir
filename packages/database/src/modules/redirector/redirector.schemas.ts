import { JSONSchemaType, counterSchema, customIdentSchema, timestampSchema } from '@famir/validator'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { RedirectorParams } from './redirector.models.js'

/**
 * JSON Schema for validating a redirector page template.
 *
 * @category Redirector
 */
export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024,
} as const

/**
 * JSON Schema for validating a redirector field name.
 *
 * @category Redirector
 */
export const redirectorFieldSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
}

/**
 * JSON Schema for validating a list of redirector field names.
 *
 * @category Redirector
 */
export const redirectorFieldsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: redirectorFieldSchema,
} as const

/**
 * JSON Schema for validating redirector parameters.
 *
 * @category Redirector
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
 * JSON Schema for validating raw redirector data from Redis.
 *
 * @category Redirector
 * @internal
 */
export const rawRedirectorSchema: JSONSchemaType<RawRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'lure_count', 'created_at'],
  properties: {
    campaign_id: customIdentSchema,
    redirector_id: customIdentSchema,
    lure_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating raw full redirector data from Redis.
 *
 * @category Redirector
 * @internal
 */
export const rawFullRedirectorSchema: JSONSchemaType<RawFullRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'page', 'fields', 'lure_count', 'created_at'],
  properties: {
    campaign_id: customIdentSchema,
    redirector_id: customIdentSchema,
    page: redirectorPageSchema,
    fields: redirectorFieldsSchema,
    lure_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const
