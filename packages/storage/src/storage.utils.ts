import { StorageConfig, StorageOptions } from './storage.js'

export function buildOptions(data: StorageConfig): StorageOptions {
  return {
    endPoint: data.STORAGE_END_POINT,
    port: data.STORAGE_PORT,
    useSSL: data.STORAGE_USE_SSL,
    accessKey: data.STORAGE_ACCESS_KEY,
    secretKey: data.STORAGE_SECRET_KEY
  }
}
