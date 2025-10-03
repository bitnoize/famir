import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  Storage,
  STORAGE,
  Validator,
  VALIDATOR
} from '@famir/domain'
import * as Minio from 'minio'
import { StorageConfig, StorageOptions } from './storage.js'
import { buildOptions, filterOptionsSecrets, internalSchemas } from './storage.utils.js'

export class MinioStorage implements Storage {
  static inject(container: DIContainer) {
    container.registerSingleton<Storage>(
      STORAGE,
      (c) =>
        new MinioStorage(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<StorageConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: StorageOptions
  private readonly _minio: Minio.Client

  constructor(
    validator: Validator,
    config: Config<StorageConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(internalSchemas)

    this.options = buildOptions(config.data)

    this._minio = new Minio.Client({
      endPoint: this.options.endPoint,
      port: this.options.port,
      useSSL: this.options.useSSL,
      accessKey: this.options.accessKey,
      secretKey: this.options.secretKey
    })

    this.logger.debug(
      {
        module: 'storage',
        options: filterOptionsSecrets(this.options)
      },
      `Storage initialized`
    )
  }
}
