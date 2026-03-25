import { JSONSchemaType } from '@famir/validator'

export const configRedisProduceConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
  //default: 'redis://localhost:6379/1'
} as const

export const configRedisProducePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull'
} as const
