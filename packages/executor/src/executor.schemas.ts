import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'

export const configExecutorConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/1'
} as const

export const configExecutorPrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull'
} as const

export const configExecutorConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100
} as const

export const configExecutorLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000
} as const

export const configExecutorLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000
} as const

export const executorSchemas: ValidatorSchemas = {}
