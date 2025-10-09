import { RedirectorModel } from '../../models/index.js'

export interface CreateRedirectorModel {
  campaignId: string
  redirectorId: string
  page: string
}

export interface ReadRedirectorModel {
  campaignId: string
  redirectorId: string
}

export interface UpdateRedirectorModel {
  campaignId: string
  redirectorId: string
  page: string | null | undefined
}

export interface DeleteRedirectorModel {
  campaignId: string
  redirectorId: string
}

export interface ListRedirectorModels {
  campaignId: string
}

export interface RedirectorRepository {
  create(data: CreateRedirectorModel): Promise<RedirectorModel>
  read(data: ReadRedirectorModel): Promise<RedirectorModel | null>
  update(data: UpdateRedirectorModel): Promise<RedirectorModel>
  delete(data: DeleteRedirectorModel): Promise<RedirectorModel>
  list(data: ListRedirectorModels): Promise<RedirectorModel[] | null>
}

export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')
