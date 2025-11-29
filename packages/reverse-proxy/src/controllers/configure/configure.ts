import { EnabledFullTargetModel, EnabledTargetModel, FullCampaignModel } from '@famir/domain'

export interface ConfigureData {
  campaignId: string
  targetId: string
  clientIp: string
}

export interface ConfigureReply {
  campaign: FullCampaignModel
  target: EnabledFullTargetModel
  targets: EnabledTargetModel[]
}
