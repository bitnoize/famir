import { FullRedirectorModel, RedirectorModel } from '../../models/index.js'

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

export interface RedirectorRepository {
  createRedirector(data: CreateRedirectorData): Promise<RedirectorModel>
  readRedirector(data: ReadRedirectorData): Promise<FullRedirectorModel | null>
  updateRedirector(data: UpdateRedirectorData): Promise<RedirectorModel>
  deleteRedirector(data: DeleteRedirectorData): Promise<RedirectorModel>
  listRedirectors(data: ListRedirectorsData): Promise<RedirectorModel[] | null>
}

export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')
