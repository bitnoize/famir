/**
 * Represents a base worker.
 *
 * @category none
 * @internal
 */
export interface BaseWorker {
  /**
   * Starts the worker, enabling it to process jobs.
   *
   * The worker will begin processing jobs from the queue based on its specification.
   * This method should be called during application bootstrap after all processors
   * have been registered with the router.
   *
   * @throws {@link BootstrapError} If the worker cannot be started.
   */
  run(): Promise<void>

  /**
   * Gracefully closes the worker.
   *
   * The worker stops processing new jobs and waits for current jobs to complete.
   * This method should be called during application shutdown to ensure
   * all pending jobs are completed and resources are released.
   *
   * @throws {@link BootstrapError} If the worker cannot be closed properly.
   */
  close(): Promise<void>
}

/**
 * Settings for a consumer worker.
 *
 * @category none
 */
export interface ConsumerWorkerSettings {
  /** Maximum number of jobs to process concurrently. */
  concurrency: number
  /** Maximum number of jobs to process within the duration window. */
  limiterMax: number
  /** Time window in milliseconds for the rate limiter. */
  limiterDuration: number
}
