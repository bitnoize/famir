import { Validator } from '@famir/validator'
import { ConsumerError } from './consumer.error.js'

/**
 * Represents the consumer processor spec.
 */
export interface ConsumerProcessorSpec {
  readonly queueName: string
  readonly jobName: string
  readonly schemaName: string
}

/**
 * Represents the consumer processor action function.
 *
 * @param data - The job data payload.
 * @returns The job result.
 *
 * @category none
 */
export type ConsumerProcessorAction<T> = (spec: ConsumerProcessorSpec, data: T) => Promise<void>

/**
 * Represents the consumer processor.
 */
export class ConsumerProcessor<T> {
  /**
   * Creates a new processor instance.
   *
   * @param validator - The validator instance.
   * @param spec - The spec object.
   * @param action - The action function.
   */
  constructor(
    protected readonly validator: Validator,
    public readonly spec: ConsumerProcessorSpec,
    protected readonly action: ConsumerProcessorAction<T>
  ) {}

  async execute(data: unknown): Promise<void> {
    try {
      this.validateData(data)

      await this.action(this.spec, data)
    } catch (error) {
      this.handleProcessorError(error, 'execute', data)
    }
  }

  /**
   * Handles processor errors.
   *
   * Re-throws `ConsumerError` instances with additional context, or wraps
   * unknown errors into a `ConsumerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param data - The data that were being processed.
   * @returns Never returns, always throws.
   */
  protected handleProcessorError(error: unknown, level: string, data: unknown): never {
    if (error instanceof ConsumerError) {
      error.context['level'] = level
      error.context['spec'] = this.spec
      error.context['data'] = data

      throw error
    } else {
      throw new ConsumerError(`Unknown error`, {
        cause: error,
        context: {
          level,
          spec: this.spec,
          data,
        },
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Validates data against a registered JSON Schema.
   *
   * @param value - The data to validate.
   * @throws {@link ConsumerError} If validation fails.
   */
  protected validateData(value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(this.spec.schemaName, value)
    } catch (error) {
      throw new ConsumerError(`Validate data failed`, {
        cause: error,
        code: 'BAD_REQUEST',
      })
    }
  }
}
