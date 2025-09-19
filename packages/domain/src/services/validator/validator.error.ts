import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export interface ValidatorValidateError {
  keyword: string
  instancePath: string
  schemaPath: string
  params: object
  propertyName: string | undefined
  message: string | undefined
}

export type ValidatorErrorOptions = DomainErrorOptions & {
  validateErrors: ValidatorValidateError[]
}

export class ValidatorError extends DomainError {
  validateErrors: ValidatorValidateError[]

  constructor(message: string, options: ValidatorErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ValidatorError'
    this.validateErrors = options.validateErrors
  }
}
