import { EnabledFullTargetModel, EnabledTargetModel, FullCampaignModel } from '@famir/domain'

export interface SetupMirrorData {
  campaignId: string
  targetId: string
}

export interface SetupMirrorReply {
  campaign: FullCampaignModel
  target: EnabledFullTargetModel
  targets: EnabledTargetModel[]
}
