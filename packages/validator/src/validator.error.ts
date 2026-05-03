import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Details of a single JSON schema validation error.
 *
 * Contains information about what failed validation and why.
 *
 * @category none
 */
export interface ValidatorValidateError {
  /** Validation keyword that failed (e.g., 'required', 'type', 'format') */
  keyword: string
  /** JSONPointer to the instance that failed validation */
  instancePath: string
  /** JSONPointer to the schema keyword that failed */
  schemaPath: string
  /** Additional parameters for this validation error */
  params: object
  /** Name of the property that caused the error (if applicable) */
  propertyName: string | undefined
  /** Human-readable error message */
  message: string | undefined
}

/**
 * Options for creating a ValidatorError with error collection.
 *
 * @category none
 */
export type ValidatorErrorOptions = CommonErrorOptions & {
  validateErrors: ValidatorValidateError[]
}

/**
 * Error thrown when JSON schema validation fails.
 *
 * Contains validation error details and context for debugging.
 *
 * @example
 * ```ts
 * try {
 *   validator.assertSchema<Config>('config', data)
 * } catch (error) {
 *   if (error instanceof ValidatorError) {
 *     console.log('Validation failed:')
 *     error.validateErrors.forEach((err) => {
 *       console.log(`  - ${err.instancePath}: ${err.message}`)
 *     })
 *     console.log('Context:', error.context)
 *   }
 * }
 * ```
 *
 * @category none
 */
export class ValidatorError extends CommonError {
  /**
   * Detailed validation errors.
   */
  validateErrors: ValidatorValidateError[]

  /**
   * Create a new validator error.
   *
   * @param message - Error message
   * @param options - Error options including validateErrors and context
   */
  constructor(message: string, options: ValidatorErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'ValidatorError'
    this.validateErrors = options.validateErrors
  }
}
