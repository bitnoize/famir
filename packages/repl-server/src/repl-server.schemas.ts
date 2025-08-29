import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'

export const configReplServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: '127.0.0.1'
} as const

export const configReplServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
  default: 5000
} as const

export const configReplServerMaxConnectionsSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 100,
  default: 10
} as const

export const configReplServerSocketTimeoutSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1000,
  maximum: 3600 * 1000,
  default: 60 * 1000
} as const

export const configReplServerPromptSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'famir > '
} as const

export const configReplServerUseColorsSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: true
} as const

export const replServerSchemas: ValidatorSchemas = {}
