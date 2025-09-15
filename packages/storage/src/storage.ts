export interface StorageConfig {
  STORAGE_END_POINT: string
  STORAGE_PORT: number
  STORAGE_USE_SSL: boolean
  STORAGE_ACCESS_KEY: string
  STORAGE_SECRET_KEY: string
}

export interface StorageOptions {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
}
