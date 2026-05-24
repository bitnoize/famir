import { JSONSchemaType } from '@famir/validator'
import { MinioStorageConfig } from './storage.js'

/**
 * JSON Schema for validating a MinIO storage endpoint.
 *
 * @internal
 */
const minioStorageEndPointSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'localhost',
} as const

/**
 * JSON Schema for validating a MinIO storage port.
 *
 * @internal
 */
const minioStoragePortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
  default: 9000,
} as const

/**
 * JSON Schema for validating a MinIO storage SSL usage.
 *
 * @internal
 */
const minioStorageUseSSLSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
}

/**
 * JSON Schema for validating a MinIO storage access key.
 *
 * @internal
 */
const minioStorageAccessKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * JSON Schema for validating a MinIO storage secret key.
 *
 * @internal
 */
const minioStorageSecretKeySchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * JSON Schema for validating a MinIO storage bucket name.
 *
 * @internal
 */
const minioStorageBucketNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'famir',
} as const

/**
 * JSON Schema for validating a complete MinIO storage configuration.
 *
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
