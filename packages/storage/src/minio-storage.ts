import { DIContainer, isDevelopment } from '@famir/common'
import { Config, CONFIG, Logger, LOGGER, Storage, STORAGE } from '@famir/domain'
import { Client as MinioClient } from 'minio'
import { StorageConfig, StorageOptions } from './storage.js'
import { buildOptions } from './storage.utils.js'

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
    this.options = buildOptions(config.data)

    this.minio = new MinioClient({
      endPoint: this.options.endPoint,
      port: this.options.port,
      useSSL: this.options.useSSL,
      accessKey: this.options.accessKey,
      secretKey: this.options.secretKey
    })

    this.logger.debug(`Storage initialized`, {
      options: isDevelopment ? this.options : null
    })
  }
}
