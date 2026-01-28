import { CampaignModel } from '../campaign/index.js'

export const TARGET_SUB_ROOT = '.'

export interface TargetModel {
  readonly campaignId: string
  readonly targetId: string
  readonly isLanding: boolean
  readonly donorSecure: boolean
  readonly donorSub: string
  readonly donorDomain: string
  readonly donorPort: number
  readonly mirrorSecure: boolean
  readonly mirrorSub: string
  readonly mirrorPort: number
  readonly isEnabled: boolean
  readonly messageCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const testTargetModel = <T extends TargetModel>(value: T | null): value is T => {
  return value != null
}

export interface FullTargetModel extends TargetModel {
  readonly labels: string[]
  readonly connectTimeout: number
  readonly ordinaryTimeout: number
  readonly streamingTimeout: number
  readonly requestBodyLimit: number
  readonly responseBodyLimit: number
  readonly mainPage: string
  readonly notFoundPage: string
  readonly faviconIco: string
  readonly robotsTxt: string
  readonly sitemapXml: string
}

export interface EnabledTargetModel extends TargetModel {
  isEnabled: true
}

export interface EnabledFullTargetModel extends FullTargetModel {
  isEnabled: true
}

export const testEnabledTargetModel = <T extends TargetModel>(
  value: T
): value is T & { isEnabled: true } => {
  return value.isEnabled
}

export const testTargetHasLabel = (target: FullTargetModel, value: string): boolean => {
  return target.labels.some((label) => {
    return Array.isArray(value) ? value.includes(label) : value === label
  })
}

export const getTargetDonorProtocol = (target: TargetModel): string => {
  return target.donorSecure ? 'https:' : 'http:'
}

export const getTargetDonorHostname = (target: TargetModel): string => {
  return target.donorSub !== TARGET_SUB_ROOT
    ? target.donorSub + '.' + target.donorDomain
    : target.donorDomain
}

export const getTargetDonorHost = (target: TargetModel): string => {
  const hostname = getTargetDonorHostname(target)

  if (
    (!target.donorSecure && target.donorPort === 80) ||
    (target.donorSecure && target.donorPort === 443)
  ) {
    return hostname
  } else {
    return hostname + ':' + target.donorPort.toString()
  }
}

export const getTargetMirrorProtocol = (target: TargetModel): string => {
  return target.mirrorSecure ? 'https:' : 'http:'
}

export const getTargetMirrorHostname = (campaign: CampaignModel, target: TargetModel): string => {
  return target.mirrorSub !== TARGET_SUB_ROOT
    ? target.mirrorSub + '.' + campaign.mirrorDomain
    : campaign.mirrorDomain
}

export const getTargetMirrorHost = (campaign: CampaignModel, target: TargetModel): string => {
  const hostname = getTargetMirrorHostname(campaign, target)

  if (
    (!target.mirrorSecure && target.mirrorPort === 80) ||
    (target.mirrorSecure && target.mirrorPort === 443)
  ) {
    return hostname
  } else {
    return hostname + ':' + target.mirrorPort.toString()
  }
}
