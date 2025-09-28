import { JSONSchemaType } from '@famir/common'

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
