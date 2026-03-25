import { JSONSchemaType } from '@famir/validator'

export const configNetReplServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const configNetReplServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535
} as const

export const configNetReplServerMaxClientsSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 100,
  default: 10
} as const

export const configNetReplServerSocketTimeoutSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1000,
  maximum: 3600 * 1000,
  default: 15 * 60 * 1000
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
