import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'

export const configHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: '127.0.0.1'
} as const

export const configHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
  default: 3000
} as const

export const configHttpServerBodyLimitSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 1024 * 1024 * 1024,
  default: 10 * 1024 * 1024
} as const

export const httpServerSchemas: ValidatorSchemas = {}
