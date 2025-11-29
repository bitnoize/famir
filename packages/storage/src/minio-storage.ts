import { DIContainer } from '@famir/common'
import { Config, CONFIG, Logger, LOGGER, Storage, STORAGE } from '@famir/domain'
import { Client as MinioClient } from 'minio'
import { StorageConfig, StorageOptions } from './storage.js'

export class MinioStorage implements Storage {
  static inject(container: DIContainer) {
    container.registerSingleton<Storage>(
      STORAGE,
      (c) => new MinioStorage(c.resolve<Config<StorageConfig>>(CONFIG), c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly options: StorageOptions
  protected readonly minio: MinioClient

  constructor(
    config: Config<StorageConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.minio = new MinioClient({
      endPoint: this.options.endPoint,
      port: this.options.port,
      useSSL: this.options.useSSL,
      accessKey: this.options.accessKey,
      secretKey: this.options.secretKey
    })
  }

  private buildOptions(config: StorageConfig): StorageOptions {
    return {
      endPoint: config.STORAGE_END_POINT,
      port: config.STORAGE_PORT,
      useSSL: config.STORAGE_USE_SSL,
      accessKey: config.STORAGE_ACCESS_KEY,
      secretKey: config.STORAGE_SECRET_KEY
    }
  }
}
