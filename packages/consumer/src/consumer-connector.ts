/**
 * DI token for a consumer connector implementation.
 *
 * @category none
 */
export const CONSUMER_CONNECTOR = Symbol('ConsumerConnector')

/**
 * Defines the public contract for a consumer connector.
 *
 * The connector is responsible for establishing and managing the
 * lifecycle of the consumer connection.
 *
 * @category none
 */
export interface ConsumerConnector {
  /**
   * Retrieves the underlying consumer connection.
   *
   * This method uses a type assertion to return the connection as the requested type.
   * It is the caller's responsibility to ensure the correct type is used.
   *
   * @typeParam T - The expected type of the consumer connection.
   * @returns The consumer connection cast to type `T`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T

  /**
   * Establishes a connection to the consumer.
   *
   * This method should be called during application bootstrap to ensure
   * the connection is ready before any operations are performed.
   *
   * @throws LifecycleError If the consumer connection cannot be established.
   */
  connect(): Promise<void>

  /**
   * Gracefully closes a connection to the consumer.
   *
   * This method should be called during application shutdown to ensure
   * all pending operations are completed and resources are released.
   *
   * @throws LifecycleError If the connection cannot be closed properly.
   */
  close(): Promise<void>
}
