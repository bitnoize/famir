import { FullRedirectorModel, RedirectorModel } from '../../models/index.js'

export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')

export interface RedirectorRepository {
  create(campaignId: string, redirectorId: string, page: string, lockSecret: string): Promise<void>
  read(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null>
  update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockSecret: string
  ): Promise<void>
  delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void>
  list(campaignId: string): Promise<RedirectorModel[] | null>
}
