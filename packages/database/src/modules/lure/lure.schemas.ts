import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawLure } from './lure.functions.js'

/**
 * Schema for validating lure path.
 *
 * @category Lure
 * @internal
 */
export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * Schema for validating raw lure data from Redis.
 *
 * @category Lure
 * @internal
 */
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
  ],
  properties: {
    campaign_id: customIdentSchema,
    lure_id: customIdentSchema,
    path: lurePathSchema,
    redirector_id: customIdentSchema,
    is_enabled: booleanSchema,
    session_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Collection of all schemas used by the lure module.
 *
 * @category Lure
 * @internal
 */
export const lureSchemas: ValidatorSchemas = {
  'database-raw-lure': rawLureSchema,
} as const
