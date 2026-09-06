import { JSONSchemaType } from '@famir/common'
import { RedisDatabaseConfig } from './database.js'

const redisDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'redis://localhost:6379/0',
} as const

const redisDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'famir',
} as const

/**
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
 * @category none
 * @internal
 */
export const redisDatabaseStringReplySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
} as const

/**
 * @category none
 * @internal
 */
export const redisDatabaseArrayReplySchema = {
  type: 'array',
  items: {},
} as JSONSchemaType<unknown[]>

/**
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
