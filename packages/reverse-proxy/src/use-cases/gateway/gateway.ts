import { Campaign, EnabledTarget } from '@famir/domain'

export interface GatewayDto {
  targetId: string
}

export interface GatewayResult {
  campaign: Campaign
  target: EnabledTarget
}
