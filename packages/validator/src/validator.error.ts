import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Validator validate error
 * @category none
 */
export interface ValidatorValidateError {
  keyword: string
  instancePath: string
  schemaPath: string
  params: object
  propertyName: string | undefined
  message: string | undefined
}

/**
 * Validator error options
 * @category none
 */
export type ValidatorErrorOptions = CommonErrorOptions & {
  validateErrors: ValidatorValidateError[]
}

/**
 * Represents validator error
 * @category none
 */
export class ValidatorError extends CommonError {
  validateErrors: ValidatorValidateError[]

  constructor(message: string, options: ValidatorErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'ValidatorError'
    this.validateErrors = options.validateErrors
  }
}
