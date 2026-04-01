export const STORAGE = Symbol('Storage')

/**
 * Storage contract
 */
export interface Storage {
  getObject(objectName: string): Promise<Buffer>
  putObject(objectName: string, data: Buffer, metaData: Record<string, string>): Promise<void>
}

export interface MinioStorageConfig {
  STORAGE_END_POINT: string
  STORAGE_PORT: number
  STORAGE_USE_SSL: boolean
  STORAGE_ACCESS_KEY: string
  STORAGE_SECRET_KEY: string
  STORAGE_BUCKET_NAME: string
}

export interface MinioStorageOptions {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucketName: string
}
