import { LureModel } from '../../models/index.js'

export const LURE_REPOSITORY = Symbol('LureRepository')

export interface LureRepository {
  create(campaignId: string, lureId: string, path: string, redirectorId: string): Promise<LureModel>
  read(campaignId: string, lureId: string): Promise<LureModel | null>
  readPath(campaignId: string, path: string): Promise<LureModel | null>
  enable(campaignId: string, lureId: string): Promise<LureModel>
  disable(campaignId: string, lureId: string): Promise<LureModel>
  delete(campaignId: string, lureId: string, path: string, redirectorId: string): Promise<LureModel>
  list(campaignId: string): Promise<LureModel[] | null>
}
