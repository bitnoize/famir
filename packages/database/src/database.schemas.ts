import { JSONSchemaType } from '@famir/validator'

/**
 * Schema for config redis database connection url.
 *
 * @category none
 * @internal
 */
export const configRedisDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
} as const

/**
 * Schema for config redis database prefix.
 *
 * @category none
 * @internal
 */
export const configRedisDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  default: 'famir',
} as const
