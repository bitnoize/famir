import { ConfigData } from '@famir/domain'

/**
 * Configuration for a MinIO storage.
 */
export interface MinioStorageConfig extends ConfigData {
  /** Server endpoint. */
  STORAGE_ENDPOINT: string
  /** Server port. */
  STORAGE_PORT: number
  /** Whether to use SSL for the connection. */
  STORAGE_USE_SSL: boolean
  /** Access key (username). */
  STORAGE_ACCESS_KEY: string
  /** Secret key (password). */
  STORAGE_SECRET_KEY: string
  /** Name of the bucket to use. */
  STORAGE_BUCKET_NAME: string
}
