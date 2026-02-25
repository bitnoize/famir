export const STORAGE = Symbol('Storage')

export interface Storage {
  get(objectName: string): Promise<Buffer>
  put(objectName: string, data: Buffer, metaData: Record<string, string>): Promise<void>
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
