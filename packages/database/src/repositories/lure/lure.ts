import { LureModel } from '../../models/index.js'

export const LURE_REPOSITORY = Symbol('LureRepository')

export interface LureRepository {
  create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>
  read(campaignId: string, lureId: string): Promise<LureModel | null>
  readPath(campaignId: string, path: string): Promise<LureModel | null>
  enable(campaignId: string, lureId: string, lockSecret: string): Promise<void>
  disable(campaignId: string, lureId: string, lockSecret: string): Promise<void>
  delete(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>
  list(campaignId: string): Promise<LureModel[] | null>
}
