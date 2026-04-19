export const READ_REDIRECTOR_USE_CASE = Symbol('ReadRedirectorUseCase')

export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}
