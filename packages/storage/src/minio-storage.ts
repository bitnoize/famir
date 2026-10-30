import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  LifecycleError,
  Logger,
  LOGGER,
  Storage,
  STORAGE,
  StorageError,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { Client as MinioClient } from 'minio'
import consumers from 'node:stream/consumers'
import { MinioStorageConfig } from './storage.js'
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

    const conf = this.config.get<MinioStorageConfig>('storage-config')
    this.options = this.buildOptions(conf)

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
        throw LifecycleError.create(`Bucket does not exist`, {
          bucket: this.options.bucketName,
        })
      }
    } catch (error) {
      throw LifecycleError.wrap(error, {
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
  private buildOptions(conf: MinioStorageConfig): MinioStorageOptions {
    return {
      endPoint: conf.STORAGE_ENDPOINT,
      port: conf.STORAGE_PORT,
      useSSL: conf.STORAGE_USE_SSL,
      accessKey: conf.STORAGE_ACCESS_KEY,
      secretKey: conf.STORAGE_SECRET_KEY,
      bucketName: conf.STORAGE_BUCKET_NAME,
    }
  }
}
