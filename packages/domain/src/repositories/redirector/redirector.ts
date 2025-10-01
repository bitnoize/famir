import { RedirectorModel } from '../../models/index.js'

export interface CreateRedirectorData {
  campaignId: string
  id: string
  page: string
}

export interface ReadRedirectorData {
  campaignId: string
  id: string
}

export interface UpdateRedirectorData {
  campaignId: string
  id: string
  page: string | null | undefined
}

export interface DeleteRedirectorData {
  campaignId: string
  id: string
}

export interface ListRedirectorsData {
  campaignId: string
}

export interface RedirectorRepository {
  create(data: CreateRedirectorData): Promise<RedirectorModel>
  read(data: ReadRedirectorData): Promise<RedirectorModel | null>
  update(data: UpdateRedirectorData): Promise<RedirectorModel>
  delete(data: DeleteRedirectorData): Promise<RedirectorModel>
  list(data: ListRedirectorsData): Promise<RedirectorModel[] | null>
}
