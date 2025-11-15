export const TARGET_SUB_ROOT = '.'

export interface TargetModel {
  readonly campaignId: string
  readonly targetId: string
  readonly isLanding: boolean
  readonly donorSecure: boolean
  readonly donorSub: string
  readonly donorDomain: string
  readonly donorPort: string
  readonly mirrorSecure: boolean
  readonly mirrorSub: string
  readonly mirrorPort: string
  readonly isEnabled: boolean
  readonly messageCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface EnabledTargetModel extends TargetModel {
  isEnabled: true
}

export interface FullTargetModel extends TargetModel {
  readonly labels: string[]
  readonly connectTimeout: number
  readonly regularTimeout: number
  readonly streamingTimeout: number
  readonly requestDataLimit: number
  readonly responseDataLimit: number
  readonly mainPage: string
  readonly notFoundPage: string
  readonly faviconIco: string
  readonly robotsTxt: string
  readonly sitemapXml: string
  readonly successRedirectUrl: string
  readonly failureRedirectUrl: string
}

export interface EnabledFullTargetModel extends FullTargetModel {
  isEnabled: true
}
