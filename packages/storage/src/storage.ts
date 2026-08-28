import { ConfigData } from '@famir/config'

/**
 * DI token for a storage implementation.
 */
export const STORAGE = Symbol('Storage')

/**
 * Defines the public contract for a storage.
 *
 * Provides methods for basic S3-compatible storage operations: get, put, and delete.
 */
export interface Storage {
  /**
   * Checks that the configured bucket exists.
   *
   * This method is typically called during application startup to verify
   * that the storage bucket is accessible.
   *
   * @throws LifecycleError If the bucket does not exist or is inaccessible.
   */
  checkBucketExists(): Promise<void>

  /**
   * Retrieves an object from the storage.
   *
   * @param objectName - The path of the object to retrieve.
   * @returns The object content as a Buffer.
   * @throws StorageError If the object cannot be retrieved.
   */
  getObject(objectName: string): Promise<Buffer>

  /**
   * Stores an object in the storage.
   *
   * @param objectName - The path to assign to the object.
   * @param data - The object content as a Buffer.
   * @param headers - Custom headers to attach to the object.
   * @throws StorageError If the object cannot be stored.
   */
  putObject(objectName: string, data: Buffer, headers: Record<string, string>): Promise<void>

  /**
   * Deletes an object from the storage.
   *
   * @param objectName - The path of the object to delete.
   * @throws StorageError If the object cannot be deleted.
   */
  deleteObject(objectName: string): Promise<void>
}

/**
 * Configuration for a MinIO storage.
 */
export interface MinioStorageConfig extends ConfigData {
  /** MinIO server endpoint. */
  STORAGE_ENDPOINT: string
  /** MinIO server port. */
  STORAGE_PORT: number
  /** Whether to use SSL/TLS for the connection. */
  STORAGE_USE_SSL: boolean
  /** MinIO access key (username). */
  STORAGE_ACCESS_KEY: string
  /** MinIO secret key (password). */
  STORAGE_SECRET_KEY: string
  /** Name of the bucket to use for storage operations. */
  STORAGE_BUCKET_NAME: string
}
