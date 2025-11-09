import { CampaignModel, EnabledTargetModel } from '@famir/domain'

export interface SetupMirrorHeaders {
  campaignId: string
  targetId: string
}

export interface SetupMirrorData {
  setupHeaders: SetupMirrorHeaders
}

export interface SetupMirrorResult {
  campaign: CampaignModel
  target: EnabledTargetModel
}
