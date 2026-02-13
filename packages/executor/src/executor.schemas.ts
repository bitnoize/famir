import { JSONSchemaType } from '@famir/validator'

export const configRedisExecutorConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/1'
} as const

export const configRedisExecutorPrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull'
} as const

export const configBullExecutorConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100
} as const

export const configBullExecutorLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000
} as const

export const configBullExecutorLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000
} as const
