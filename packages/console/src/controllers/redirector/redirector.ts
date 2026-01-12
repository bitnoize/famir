export interface CreateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string
  lockCode: number
}

export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

export interface UpdateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string | null | undefined
  lockCode: number
}

export interface DeleteRedirectorData {
  campaignId: string
  redirectorId: string
  lockCode: number
}

export interface ListRedirectorsData {
  campaignId: string
}
