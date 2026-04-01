import { JSONSchemaType } from '@famir/validator'

export const configRedisDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string'
} as const

export const configRedisDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  default: 'famir'
} as const
