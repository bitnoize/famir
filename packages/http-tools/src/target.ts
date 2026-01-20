import { CampaignModel, HttpUrl, TARGET_SUB_ROOT, TargetModel } from '@famir/domain'

export function getTargetDonorHostname(target: TargetModel): string {
  return target.donorSub !== TARGET_SUB_ROOT
    ? target.donorSub + '.' + target.donorDomain
    : target.donorDomain
}

export function getTargetDonorHost(target: TargetModel): string {
  const hostname = getTargetDonorHostname(target)
  return hostname + ':' + target.donorPort
}

export function getTargetMirrorHostname(campaign: CampaignModel, target: TargetModel): string {
  return target.mirrorSub !== TARGET_SUB_ROOT
    ? target.mirrorSub + '.' + campaign.mirrorDomain
    : campaign.mirrorDomain
}

export function getTargetMirrorHost(campaign: CampaignModel, target: TargetModel): string {
  const hostname = getTargetMirrorHostname(campaign, target)
  return hostname + ':' + target.donorPort
}

export function refreshTargetMirrorUrl(url: HttpUrl, campaign: CampaignModel, target: TargetModel) {
  url.protocol = target.mirrorSecure ? 'https:' : 'http:'
  url.hostname = getTargetMirrorHostname(campaign, target)
  url.port = target.mirrorPort.toString()
}

export function refreshTargetDonorUrl(url: HttpUrl, target: TargetModel) {
  url.protocol = target.donorSecure ? 'https:' : 'http:'
  url.hostname = getTargetDonorHostname(target)
  url.port = target.donorPort.toString()
}
