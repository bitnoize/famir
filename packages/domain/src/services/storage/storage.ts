/**
 * DI token for a storage implementation.
 *
 * @category Storage Service
 */
export const STORAGE = Symbol('Storage')

/**
 * Defines the public contract for a storage.
 *
 * Provides methods for basic S3-compatible storage operations: get, put, and delete.
 *
 * @category Storage Service
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
