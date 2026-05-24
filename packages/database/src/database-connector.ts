/**
 * DI token for a database connector implementation.
 *
 * @category none
 */
export const DATABASE_CONNECTOR = Symbol('DatabaseConnector')

/**
 * Defines the public contract for a database connector.
 *
 * The connector is responsible for establishing and managing the
 * lifecycle of the database connection.
 *
 * @category none
 */
export interface DatabaseConnector {
  /**
   * Retrieves the underlying database connection.
   *
   * This method uses a type assertion to return the connection as the requested type.
   * It is the caller's responsibility to ensure the correct type is used.
   *
   * @typeParam T - The expected type of the database connection.
   * @returns The database connection cast to type `T`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T

  /**
   * Establishes a connection to the database.
   *
   * This method should be called during application bootstrap to ensure
   * the connection is ready before any operations are performed.
   *
   * @throws {@link BootstrapError} If the database connection cannot be established.
   */
  connect(): Promise<void>

  /**
   * Gracefully closes a connection to the database.
   *
   * This method should be called during application shutdown to ensure
   * all pending operations are completed and resources are released.
   *
   * @throws {@link BootstrapError} If the connection cannot be closed properly.
   */
  close(): Promise<void>
}
