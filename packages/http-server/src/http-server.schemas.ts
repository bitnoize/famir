import { JSONSchemaType } from '@famir/common'
import { DEFAULT_ERROR_PAGE } from './http-server.utils.js'

export const configHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const configHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535
} as const

export const configHttpServerBodyLimitSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 1024 * 1024 * 1024,
  default: 10 * 1024 * 1024
} as const

export const configHttpServerErrorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  default: DEFAULT_ERROR_PAGE
} as const
