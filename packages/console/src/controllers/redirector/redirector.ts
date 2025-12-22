export interface CreateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string
}

export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

export interface UpdateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string | null | undefined
}

export interface DeleteRedirectorData {
  campaignId: string
  redirectorId: string
}

export interface ListRedirectorsData {
  campaignId: string
}
