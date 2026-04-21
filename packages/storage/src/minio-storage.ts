import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Client as MinioClient } from 'minio'
import consumers from 'node:stream/consumers'
import { StorageError } from './storage.error.js'
import { MinioStorageConfig, MinioStorageOptions, Storage, STORAGE } from './storage.js'

/**
 * Minio storage implementation
 *
 * @category none
 * @see [MinIO Client SDK](https://github.com/minio/minio-js)
 */
export class MinioStorage implements Storage {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
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
      secretKey: this.options.secretKey,
    })

    this.logger.debug(`Storage initialized`)
  }

  async getObject(objectName: string): Promise<Buffer> {
    try {
      await this.minio.statObject(this.options.bucketName, objectName)

      const stream = await this.minio.getObject(this.options.bucketName, objectName)

      return await consumers.buffer(stream)
    } catch (error) {
      this.raiseError(error, 'getObject', { objectName })
    }
  }

  async putObject(
    objectName: string,
    data: Buffer,
    metaData: Record<string, string | undefined>
  ): Promise<void> {
    try {
      metaData['Content-Length'] = data.length.toString()

      await this.minio.putObject(this.options.bucketName, objectName, data, data.length, metaData)
    } catch (error) {
      this.raiseError(error, 'putObject', { objectName })
    }
  }

  protected raiseError(error: unknown, method: string, data: unknown): never {
    if (error instanceof StorageError) {
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new StorageError(`Service internal error`, {
        cause: error,
        context: {
          method,
          data,
        },
        code: 'INTERNAL_ERROR',
      })
    }
  }

  private buildOptions(config: MinioStorageConfig): MinioStorageOptions {
    return {
      endPoint: config.STORAGE_END_POINT,
      port: config.STORAGE_PORT,
      useSSL: config.STORAGE_USE_SSL,
      accessKey: config.STORAGE_ACCESS_KEY,
      secretKey: config.STORAGE_SECRET_KEY,
      bucketName: config.STORAGE_BUCKET_NAME,
    }
  }
}
