import { JSONSchemaType } from '@famir/validator'
import { DEFAULT_ERROR_PAGE } from './http-server.js'

export const configHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const configHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535
} as const

export const configHttpServerErrorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  default: DEFAULT_ERROR_PAGE
} as const
