import { JSONSchemaType } from '@famir/validator'

export const configRedisDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/0'
} as const

export const configRedisDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'famir'
} as const
