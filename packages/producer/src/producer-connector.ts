/**
 * DI token for a producer connector implementation.
 *
 * @category none
 */
export const PRODUCER_CONNECTOR = Symbol('ProducerConnector')

/**
 * Defines the public contract for a producer connector.
 *
 * The connector is responsible for establishing and managing the
 * lifecycle of the producer connection.
 *
 * @category none
 */
export interface ProducerConnector {
  /**
   * Retrieves the underlying producer connection.
   *
   * This method uses a type assertion to return the connection as the requested type.
   * It is the caller's responsibility to ensure the correct type is used.
   *
   * @typeParam T - The expected type of the producer connection.
   * @returns The producer connection cast to type `T`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T

  /**
   * Establishes a connection to the producer.
   *
   * This method should be called during application bootstrap to ensure
   * the connection is ready before any operations are performed.
   *
   * @throws {@link BootstrapError} If the producer connection cannot be established.
   */
  connect(): Promise<void>

  /**
   * Gracefully closes a connection to the producer.
   *
   * This method should be called during application shutdown to ensure
   * all pending operations are completed and resources are released.
   *
   * @throws {@link BootstrapError} If the connection cannot be closed properly.
   */
  close(): Promise<void>
}
