/**
 * Represents a base queue.
 *
 * @category none
 * @internal
 */
export interface BaseQueue {
  /**
   * Gracefully closes the queue.
   *
   * This method should be called during application shutdown.
   *
   * @throws LifecycleError If the queue cannot be closed properly.
   */
  close(): Promise<void>

  /**
   * Retrieves the total number of jobs in the queue.
   *
   * @returns The total job count.
   * @throws ProducerError If the count cannot be retrieved.
   */
  getJobCount(): Promise<number>

  /**
   * Retrieves the workers for the queue.
   *
   * @returns The queue workers list.
   * @throws ProducerError If the workers cannot be retrieved.
   */
  getWorkers(): Promise<object[]>
}
