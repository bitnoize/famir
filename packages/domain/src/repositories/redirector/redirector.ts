import { RedirectorModel } from '../../models/index.js'

export interface RedirectorRepository {
  create(campaignId: string, id: string, page: string): Promise<RedirectorModel>

  read(campaignId: string, id: string): Promise<RedirectorModel | null>

  update(campaignId: string, id: string, page: string | null | undefined): Promise<RedirectorModel>

  delete(campaignId: string, id: string): Promise<RedirectorModel>

  list(campaignId: string): Promise<RedirectorModel[] | null>
}
