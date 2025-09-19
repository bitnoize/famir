import { DisabledLureModel, EnabledLureModel, LureModel } from '../../models/index.js'

export interface LureRepository {
  create(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<DisabledLureModel>

  read(campaignId: string, id: string): Promise<LureModel | null>

  readPath(campaignId: string, path: string): Promise<EnabledLureModel | null>

  enable(campaignId: string, id: string): Promise<EnabledLureModel>

  disable(campaignId: string, id: string): Promise<DisabledLureModel>

  delete(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<DisabledLureModel>

  list(campaignId: string): Promise<LureModel[] | null>
}
