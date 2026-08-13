import { BootstrapError, DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Client as MinioClient } from 'minio'
import consumers from 'node:stream/consumers'
import { StorageError } from './storage.error.js'
import { MinioStorageConfig, Storage, STORAGE } from './storage.js'
import { minioStorageConfigSchema } from './storage.schemas.js'

/**
 * Options for a MinIO storage.
 */
interface MinioStorageOptions {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucketName: string
}

/**
 * MinIO-based storage implementation.
 *
 * Uses the official MinIO JavaScript client to interact with MinIO or any
 * S3-compatible storage service.
 *
 * @see https://github.com/minio/minio-js - Official MinIO JavaScript client
 * @see https://docs.min.io/aistor/developers/sdk/javascript/api/ - API Reference
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { STORAGE, Storage, MinioStorage } from '@famir/storage'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * MinioStorage.register(container)
 *
 * // Resolve dependency from container
 * const storage = container.resolve<Storage>(STORAGE)
 *
 * // Checking the existence of the bucket
 * await storage.ensureBucketExists()
 *
 * // Store object in storage
 * await storage.putObject('test.txt', Buffer.from('Hello'), {
 *   'Content-Type': 'text/plain'
 * })
 *
 * // Retrieve object from storage
 * const data = await storage.getObject('test.txt')
 * console.log(data.toString()) // 'Hello'
 *
 * // Delete object from storage
 * await storage.deleteObject('test.txt')
 * ```
 */
export class MinioStorage implements Storage {
  /**
   * Registers the storage as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<Storage>(
      STORAGE,
      (c) =>
        new MinioStorage(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  /** Built storage options. */
  protected readonly options: MinioStorageOptions

  /** Underlying MinIO instance. */
  protected readonly minio: MinioClient

  /**
   * Creates a new storage instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger
  ) {
    this.validator.addSchema('storage-config', minioStorageConfigSchema)

    const configData = this.config.get<MinioStorageConfig>('storage-config')
    this.options = this.buildOptions(configData)

    this.minio = new MinioClient({
      endPoint: this.options.endPoint,
      port: this.options.port,
      useSSL: this.options.useSSL,
      accessKey: this.options.accessKey,
      secretKey: this.options.secretKey,
    })
  }

  async checkBucketExists(): Promise<void> {
    try {
      const exists = await this.minio.bucketExists(this.options.bucketName)

      if (!exists) {
        throw BootstrapError.create(`Bucket does not exist`, {
          bucket: this.options.bucketName,
        })
      }
    } catch (error) {
      throw BootstrapError.wrap(error, {
        service: 'storage',
      })
    }
  }

  async getObject(objectName: string): Promise<Buffer> {
    try {
      const stream = await this.minio.getObject(this.options.bucketName, objectName)

      return await consumers.buffer(stream)
    } catch (error) {
      throw StorageError.wrap(error, {
        method: 'getObject',
        params: { objectName },
      })
    }
  }

  async putObject(
    objectName: string,
    data: Buffer,
    headers: Record<string, string>
  ): Promise<void> {
    try {
      await this.minio.putObject(this.options.bucketName, objectName, data, data.length, headers)
    } catch (error) {
      throw StorageError.wrap(error, {
        method: 'putObject',
        params: { objectName, headers },
      })
    }
  }

  async deleteObject(objectName: string): Promise<void> {
    try {
      await this.minio.removeObject(this.options.bucketName, objectName)
    } catch (error) {
      throw StorageError.wrap(error, {
        method: 'deleteObject',
        params: { objectName },
      })
    }
  }

  /**
   * Converts validated configuration to a storage options.
   */
  private buildOptions(data: MinioStorageConfig): MinioStorageOptions {
    return {
      endPoint: data.STORAGE_ENDPOINT,
      port: data.STORAGE_PORT,
      useSSL: data.STORAGE_USE_SSL,
      accessKey: data.STORAGE_ACCESS_KEY,
      secretKey: data.STORAGE_SECRET_KEY,
      bucketName: data.STORAGE_BUCKET_NAME,
    }
  }
}
