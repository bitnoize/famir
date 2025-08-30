import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'

export const configTaskQueueConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/1'
} as const

export const taskQueueSchemas: ValidatorSchemas = {}
