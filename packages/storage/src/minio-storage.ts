import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Client as MinioClient } from 'minio'
import { Readable } from 'node:stream'
import { StorageError } from './storage.error.js'
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

  async get(objectName: string): Promise<Buffer> {
    try {
      const stream = await this.minio.getObject(this.options.bucketName, objectName)

      return await this.loadStream(stream)
    } catch (error) {
      this.raiseError(error, 'fetch', { objectName })
    }
  }

  async put(objectName: string, data: Buffer, metaData: Record<string, string>): Promise<void> {
    try {
      metaData['Content-Length'] = data.length.toString()

      await this.minio.putObject(this.options.bucketName, objectName, data, data.length, metaData)
    } catch (error) {
      this.raiseError(error, 'upload', { objectName })
    }
  }

  protected loadStream(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      stream.on('end', () => {
        const data = Buffer.concat(chunks)

        resolve(data)
      })

      stream.on('error', (error) => {
        reject(error)
      })
    })
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
          data
        },
        code: 'INTERNAL_ERROR'
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
      bucketName: config.STORAGE_BUCKET_NAME
    }
  }
}
