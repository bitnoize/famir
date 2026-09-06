import { JSONSchemaType } from '@famir/common'
import { MinioStorageConfig } from './storage.js'

const minioStorageEndPointSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'localhost',
} as const

const minioStoragePortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
  default: 9000,
} as const

const minioStorageUseSSLSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
}

const minioStorageAccessKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

const minioStorageSecretKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

const minioStorageBucketNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'famir',
} as const

/**
 * @internal
 */
export const minioStorageConfigSchema: JSONSchemaType<MinioStorageConfig> = {
  type: 'object',
  required: [
    'STORAGE_ENDPOINT',
    'STORAGE_PORT',
    'STORAGE_USE_SSL',
    'STORAGE_ACCESS_KEY',
    'STORAGE_SECRET_KEY',
    'STORAGE_BUCKET_NAME',
  ],
  properties: {
    STORAGE_ENDPOINT: minioStorageEndPointSchema,
    STORAGE_PORT: minioStoragePortSchema,
    STORAGE_USE_SSL: minioStorageUseSSLSchema,
    STORAGE_ACCESS_KEY: minioStorageAccessKeySchema,
    STORAGE_SECRET_KEY: minioStorageSecretKeySchema,
    STORAGE_BUCKET_NAME: minioStorageBucketNameSchema,
  },
  additionalProperties: false,
} as const
