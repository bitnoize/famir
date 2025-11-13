import { EnabledTargetModel } from '@famir/domain'

export interface GetTargetsData {
  campaignId: string
}

export interface GetTargetsReply {
  targets: EnabledTargetModel[]
}
