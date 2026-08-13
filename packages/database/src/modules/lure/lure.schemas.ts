import {
  JSONSchemaType,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawLure } from './lure.functions.js'

/**
 * JSON Schema for validating a lure URL path.
 *
 * @category Lure
 */
export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 2,
  maxLength: 256,
} as const

/**
 * @category Lure
 * @internal
 */
export const rawLureSchema: JSONSchemaType<RawLure> = {
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
