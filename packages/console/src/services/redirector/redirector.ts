export interface CreateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string
  lockSecret: string
}

export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

export interface UpdateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string | null | undefined
  lockSecret: string
}

export interface DeleteRedirectorData {
  campaignId: string
  redirectorId: string
  lockSecret: string
}

export interface ListRedirectorsData {
  campaignId: string
}
