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
   * @throws {@link BootstrapError} If the queue cannot be closed properly.
   */
  close(): Promise<void>

  /**
   * Retrieves the total number of jobs in the queue.
   *
   * @returns The total job count.
   * @throws {@link ProducerError} If the count cannot be retrieved.
   */
  getJobCount(): Promise<number>
}
