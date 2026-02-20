import { JSONSchemaType } from '@famir/validator'

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
