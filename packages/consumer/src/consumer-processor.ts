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
      throw ConsumerError.wrap(error, {
        queue: this.spec.queueName,
        job: this.spec.jobName,
      })
    }
  }

  /**
   * Validates data against a registered JSON Schema.
   *
   * @param value - The data to validate.
   * @throws ConsumerError If validation fails.
   */
  protected validateData(value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(this.spec.schemaName, value)
    } catch (error) {
      throw ConsumerError.badRequest(`Validate data failed`, null, error)
    }
  }
}
