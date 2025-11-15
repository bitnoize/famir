import { EnabledFullTargetModel, FullCampaignModel } from '@famir/domain'

export interface GetTargetData {
  campaignId: string
  targetId: string
}

export interface GetTargetReply {
  campaign: FullCampaignModel
  target: EnabledFullTargetModel
}
