export const TARGET_SUB_ROOT = '.'

export class TargetModel {
  static isNotNull = <T extends TargetModel>(model: T | null): model is T => {
    return model != null
  }

  static isEnabled = <T extends TargetModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  constructor(
    readonly campaignId: string,
    readonly targetId: string,
    readonly isLanding: boolean,
    readonly donorSecure: boolean,
    readonly donorSub: string,
    readonly donorDomain: string,
    readonly donorPort: number,
    readonly mirrorSecure: boolean,
    readonly mirrorSub: string,
    readonly mirrorPort: number,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export class FullTargetModel extends TargetModel {
  constructor(
    campaignId: string,
    targetId: string,
    isLanding: boolean,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorPort: number,
    readonly labels: string[],
    readonly connectTimeout: number,
    readonly ordinaryTimeout: number,
    readonly streamingTimeout: number,
    readonly requestBodyLimit: number,
    readonly responseBodyLimit: number,
    readonly mainPage: string,
    readonly notFoundPage: string,
    readonly faviconIco: string,
    readonly robotsTxt: string,
    readonly sitemapXml: string,
    isEnabled: boolean,
    messageCount: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(
      campaignId,
      targetId,
      isLanding,
      donorSecure,
      donorSub,
      donorDomain,
      donorPort,
      mirrorSecure,
      mirrorSub,
      mirrorPort,
      isEnabled,
      messageCount,
      createdAt,
      updatedAt
    )
  }

  hasLabel(value: string): boolean {
    return this.labels.includes(value)
  }

  donorProtocol(): string {
    return this.donorSecure ? 'https:' : 'http:'
  }

  donorHostname(): string {
    return this.donorSub !== TARGET_SUB_ROOT
      ? [this.donorSub, this.donorDomain].join('.')
      : this.donorDomain
  }

  donorHost(): string {
    const hostname = this.donorHostname()

    if (
      (!this.donorSecure && this.donorPort === 80) ||
      (this.donorSecure && this.donorPort === 443)
    ) {
      return hostname
    } else {
      return [hostname, this.donorPort.toString()].join(':')
    }
  }

  mirrorProtocol(): string {
    return this.mirrorSecure ? 'https:' : 'http:'
  }

  mirrorHostname(mirrorDomain: string): string {
    return this.mirrorSub !== TARGET_SUB_ROOT
      ? [this.mirrorSub, mirrorDomain].join('.')
      : mirrorDomain
  }

  mirrorHost(mirrorDomain: string): string {
    const hostname = this.mirrorHostname(mirrorDomain)

    if (
      (!this.mirrorSecure && this.mirrorPort === 80) ||
      (this.mirrorSecure && this.mirrorPort === 443)
    ) {
      return hostname
    } else {
      return [hostname, this.mirrorPort.toString()].join(':')
    }
  }
}

export interface EnabledTargetModel extends TargetModel {
  isEnabled: true
}

export interface EnabledFullTargetModel extends FullTargetModel {
  isEnabled: true
}

/*
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
    return [hostname, target.mirrorPort.toString()].join(':')
  }
}
*/
