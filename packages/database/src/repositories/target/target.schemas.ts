import { JSONSchemaType } from '@famir/common'

export const targetSubSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const targetDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const targetPortSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 65535
} as const

export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000
} as const

export const targetTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 5 * 60 * 1000
} as const

export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const

export const targetRedirectUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const
