import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'

export const configTaskQueueConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string'
} as const

export const taskQueueSchemas: ValidatorSchemas = {}
