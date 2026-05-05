import {
  JSONSchemaType,
  ValidatorSchemas,
  counterSchema,
  customIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { RedirectorParams } from './redirector.models.js'

/**
 * Schema for validating redirector page.
 *
 * @category Redirector
 * @internal
 */
export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024,
} as const

/**
 * Schema for validating redirector field.
 *
 * @category Redirector
 * @internal
 */
export const redirectorFieldSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
}

/**
 * Schema for validating redirector fields.
 *
 * @category Redirector
 * @internal
 */
export const redirectorFieldsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: redirectorFieldSchema,
} as const

/**
 * Schema for validating redirector params.
 *
 * @category Redirector
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
 * Schema for validating raw redirector data from Redis.
 *
 * @category Redirector
 * @internal
 */
const rawRedirectorSchema: JSONSchemaType<RawRedirector> = {
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
 * Schema for validating raw full redirector data from Redis.
 *
 * @category Redirector
 * @internal
 */
const rawFullRedirectorSchema: JSONSchemaType<RawFullRedirector> = {
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

/**
 * Collection of all schemas used by the redirector module.
 *
 * @category Redirector
 * @internal
 */
export const redirectorSchemas: ValidatorSchemas = {
  'database-raw-redirector': rawRedirectorSchema,
  'database-raw-full-redirector': rawFullRedirectorSchema,
} as const
