import { CommonError, CommonErrorOptions } from '@famir/common'

export type HttpClientErrorCode = 'BAD_GATEWAY' | 'GATEWAY_TIMEOUT'

export type HttpClientErrorOptions = CommonErrorOptions & {
  code: HttpClientErrorCode
}

const codeToStatusMap: Record<HttpClientErrorCode, number> = {
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504
} as const

export class HttpClientError extends CommonError {
  code: HttpClientErrorCode
  status: number

  constructor(message: string, options: HttpClientErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'HttpClientError'
    this.code = options.code

    this.status = codeToStatusMap[this.code]
  }
}
