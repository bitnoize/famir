import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'

export const configTaskWorkerConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/1'
} as const

export const configTaskWorkerConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100
} as const

export const configTaskWorkerLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000
} as const

export const configTaskWorkerLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000
} as const

export const taskWorkerSchemas: ValidatorSchemas = {}
