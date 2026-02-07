export interface HttpStatusWrapper {
  clone(): HttpStatusWrapper
  freeze(): this
  get(): number
  set(status: number): this
  isInformation(): boolean
  isSuccess(): boolean
  isRedirect(): boolean
  isClientError(): boolean
  isServerError(): boolean
  isUnknown(): boolean
  reset(): this
}
