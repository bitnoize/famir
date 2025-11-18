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
  readonly regularTimeout: number
  readonly streamingTimeout: number
  readonly requestDataLimit: number
  readonly responseDataLimit: number
  //checkIp: number // 0 - disabled, 1 - blacklist, 2 - whitelist
  readonly mainPage: string
  readonly notFoundPage: string
  readonly faviconIco: string
  readonly robotsTxt: string
  readonly sitemapXml: string
  readonly successRedirectUrl: string
  readonly failureRedirectUrl: string
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
