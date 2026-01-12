import { LureModel } from '../../models/index.js'

export const LURE_REPOSITORY = Symbol('LureRepository')

export interface LureRepository {
  create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockCode: number
  ): Promise<void>
  read(campaignId: string, lureId: string): Promise<LureModel | null>
  readPath(campaignId: string, path: string): Promise<LureModel | null>
  enable(campaignId: string, lureId: string, lockCode: number): Promise<void>
  disable(campaignId: string, lureId: string, lockCode: number): Promise<void>
  delete(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockCode: number
  ): Promise<void>
  list(campaignId: string): Promise<LureModel[] | null>
}
