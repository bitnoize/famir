import { filterSecrets } from '@famir/common'
import { Config, Logger, Storage, Validator } from '@famir/domain'
import * as Minio from 'minio'
import { StorageConfig, StorageOptions } from './storage.js'
import { buildOptions } from './storage.utils.js'

export class MinioStorage implements Storage {
  protected readonly options: StorageOptions
  private readonly _minio: Minio.Client

  constructor(
    validator: Validator,
    config: Config<StorageConfig>,
    protected readonly logger: Logger
  ) {
    this.options = buildOptions(config.data)

    this._minio = new Minio.Client({
      endPoint: this.options.endPoint,
      port: this.options.port,
      useSSL: this.options.useSSL,
      accessKey: this.options.accessKey,
      secretKey: this.options.secretKey
    })

    this.logger.info(
      {
        options: filterSecrets(this.options, ['accessKey', 'secretKey'])
      },
      `MinioStorage initialized`
    )
  }
}
