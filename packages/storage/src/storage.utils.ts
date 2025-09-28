import { ValidatorSchemas } from '@famir/domain'
import { filterSecrets } from '@famir/common'
import { StorageConfig, StorageOptions } from './storage.js'

export const internalSchemas: ValidatorSchemas = {}

export function buildOptions(data: StorageConfig): StorageOptions {
  return {
    endPoint: data.STORAGE_END_POINT,
    port: data.STORAGE_PORT,
    useSSL: data.STORAGE_USE_SSL,
    accessKey: data.STORAGE_ACCESS_KEY,
    secretKey: data.STORAGE_SECRET_KEY
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, ['secretKey'])
}
