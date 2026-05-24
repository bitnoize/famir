import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Single JSON Schema validation error.
 */
export interface ValidatorValidateError {
  /** Validation keyword that failed. */
  keyword: string
  /** JSON Pointer to the instance that failed validation. */
  instancePath: string
  /** JSON Pointer to the schema keyword that failed. */
  schemaPath: string
  /** Additional parameters for the specific error. */
  params: object
  /** Name of the property that caused the error. */
  propertyName: string | undefined
  /** Human-readable error message. */
  message: string | undefined
}

/**
 * Options for creating a validator error.
 */
export type ValidatorErrorOptions = CommonErrorOptions & {
  /** A list of validation errors. */
  validateErrors: ValidatorValidateError[]
}

/**
 * Error class for validator operation failures.
 */
export class ValidatorError extends CommonError {
  /** Associated list of validation errors. */
  readonly validateErrors: ValidatorValidateError[]

  /**
   * Creates a new validator error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options including validation errors.
   */
  constructor(message: string, options: ValidatorErrorOptions) {
    super(message, options)

    this.name = 'ValidatorError'
    this.validateErrors = options.validateErrors
  }
}
