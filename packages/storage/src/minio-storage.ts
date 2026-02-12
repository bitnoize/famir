import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Client as MinioClient } from 'minio'
import { MinioStorageConfig, MinioStorageOptions, Storage, STORAGE } from './storage.js'

export class MinioStorage implements Storage {
  static inject(container: DIContainer) {
    container.registerSingleton<Storage>(
      STORAGE,
      (c) =>
        new MinioStorage(c.resolve<Config<MinioStorageConfig>>(CONFIG), c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly options: MinioStorageOptions
  protected readonly minio: MinioClient

  constructor(
    config: Config<MinioStorageConfig>,
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

    this.logger.debug(`Storage initialized`)
  }

  private buildOptions(config: MinioStorageConfig): MinioStorageOptions {
    return {
      endPoint: config.STORAGE_END_POINT,
      port: config.STORAGE_PORT,
      useSSL: config.STORAGE_USE_SSL,
      accessKey: config.STORAGE_ACCESS_KEY,
      secretKey: config.STORAGE_SECRET_KEY
    }
  }
}
