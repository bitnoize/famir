import { FullRedirectorModel, RedirectorModel } from '../../models/index.js'

export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')

export interface RedirectorRepository {
  create(campaignId: string, redirectorId: string, page: string): Promise<RedirectorModel>
  read(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null>
  update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined
  ): Promise<RedirectorModel>
  delete(campaignId: string, redirectorId: string): Promise<RedirectorModel>
  list(campaignId: string): Promise<RedirectorModel[] | null>
}
