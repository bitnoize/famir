/**
 * DI token
 * @category DI
 */
export const STORAGE = Symbol('Storage')

/**
 * Represents a storage
 * @category none
 */
export interface Storage {
  /**
   * Get object
   */
  getObject(objectName: string): Promise<Buffer>

  /**
   * Put object
   */
  putObject(objectName: string, data: Buffer, metaData: Record<string, string>): Promise<void>
}

/**
 * Minio storage config
 * @category none
 */
export interface MinioStorageConfig {
  STORAGE_END_POINT: string
  STORAGE_PORT: number
  STORAGE_USE_SSL: boolean
  STORAGE_ACCESS_KEY: string
  STORAGE_SECRET_KEY: string
  STORAGE_BUCKET_NAME: string
}

/**
 * @category none
 * @internal
 */
export interface MinioStorageOptions {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucketName: string
}
