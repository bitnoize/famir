import { JSONSchemaType } from '@famir/validator'

/**
 * @category Schemas
 * @internal
 */
export const configRedisDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
} as const

/**
 * @category Schemas
 * @internal
 */
export const configRedisDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  default: 'famir',
} as const
