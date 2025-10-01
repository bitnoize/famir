import { JSONSchemaType } from '@famir/common'

export const configStorageEndPointSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'localhost'
} as const

export const configStoragePortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
  default: 9000
} as const

export const configStorageUseSSLSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false
}

export const configStorageAccessKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'example'
} as const

export const configStorageSecretKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'secret'
} as const
