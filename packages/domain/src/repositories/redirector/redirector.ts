import { FullRedirectorModel, RedirectorModel } from '../../models/index.js'

export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')

export interface RedirectorRepository {
  create(campaignId: string, redirectorId: string, page: string, lockCode: number): Promise<void>
  read(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null>
  update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockCode: number
  ): Promise<void>
  delete(campaignId: string, redirectorId: string, lockCode: number): Promise<void>
  list(campaignId: string): Promise<RedirectorModel[] | null>
}
