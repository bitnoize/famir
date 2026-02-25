import { JSONSchemaType } from '@famir/validator'

export const configMinioStorageEndPointSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'localhost'
} as const

export const configMinioStoragePortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
  default: 9000
} as const

export const configMinioStorageUseSSLSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false
}

export const configStorageAccessKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
  //default: 'example'
} as const

export const configStorageSecretKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
  //default: 'secret'
} as const

export const configStorageBucketNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'famir'
} as const
