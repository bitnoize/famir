import { ConfigData } from '@famir/domain'

/**
 * Configuration for a MinIO storage.
 */
export interface MinioStorageConfig extends ConfigData {
  /** MinIO server endpoint. */
  STORAGE_ENDPOINT: string
  /** MinIO server port. */
  STORAGE_PORT: number
  /** Whether to use SSL/TLS for the connection. */
  STORAGE_USE_SSL: boolean
  /** MinIO access key (username). */
  STORAGE_ACCESS_KEY: string
  /** MinIO secret key (password). */
  STORAGE_SECRET_KEY: string
  /** Name of the bucket to use for storage operations. */
  STORAGE_BUCKET_NAME: string
}
