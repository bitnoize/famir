import { JSONSchemaType } from '@famir/validator'
import { RedisDatabaseConfig } from './database.js'

/**
 * JSON Schema for validating a Redis database connection URL.
 *
 * @category none
 * @internal
 */
const redisDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'redis://localhost:6379',
} as const

/**
 * JSON Schema for validating a Redis database key prefix.
 *
 * @category none
 * @internal
 */
const redisDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'famir',
} as const

/**
 * JSON Schema for validating a complete Redis database configuration.
 *
 * @category none
 * @internal
 */
export const redisDatabaseConfigSchema: JSONSchemaType<RedisDatabaseConfig> = {
  type: 'object',
  required: ['DATABASE_CONNECTION_URL', 'DATABASE_PREFIX'],
  properties: {
    DATABASE_CONNECTION_URL: redisDatabaseConnectionUrlSchema,
    DATABASE_PREFIX: redisDatabasePrefixSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a Redis string reply.
 *
 * @category none
 * @internal
 */
export const redisDatabaseStringReplySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
} as const

/**
 * JSON Schema for validating a Redis array reply.
 *
 * @category none
 * @internal
 */
export const redisDatabaseArrayReplySchema = {
  type: 'array',
  items: {},
} as JSONSchemaType<unknown[]>

/**
 * JSON Schema for validating a Redis array of non-empty strings reply.
 *
 * @category none
 * @internal
 */
export const redisDatabaseArrayStringsReplySchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: {
    type: 'string',
    minLength: 1,
  },
} as const
