import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Details of a single schema validation error.
 *
 * Contains information about what failed validation and why.
 *
 * @category none
 */
export interface ValidatorValidateError {
  /** Validation keyword that failed */
  keyword: string
  /** JSONPointer to the instance that failed validation */
  instancePath: string
  /** JSONPointer to the schema keyword that failed */
  schemaPath: string
  /** Additional parameters for this validation error */
  params: object
  /** Name of the property that caused the error */
  propertyName: string | undefined
  /** Human-readable error message */
  message: string | undefined
}

/**
 * Options for creating a validator error.
 *
 * @category none
 */
export type ValidatorErrorOptions = CommonErrorOptions & {
  validateErrors: ValidatorValidateError[]
}

/**
 * Error thrown when schema validation fails.
 *
 * @category none
 */
export class ValidatorError extends CommonError {
  /** Detailed validation errors */
  validateErrors: ValidatorValidateError[]

  /**
   * Create a new validator error instance.
   *
   * @param message - A human-readable description of the error
   * @param options - Error options
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
