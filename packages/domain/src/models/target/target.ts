export const TARGET_SUB_ROOT = '.'

export class Target {
  constructor(
    readonly campaignId: string,
    readonly id: string,
    readonly isLanding: boolean,
    readonly donorSecure: boolean,
    readonly donorSub: string,
    readonly donorDomain: string,
    readonly donorPort: number,
    readonly mirrorSecure: boolean,
    readonly mirrorSub: string,
    readonly mirrorDomain: string,
    readonly mirrorPort: number,
    readonly connectTimeout: number,
    readonly timeout: number,
    readonly mainPage: string,
    readonly notFoundPage: string,
    readonly faviconIco: string,
    readonly robotsTxt: string,
    readonly sitemapXml: string,
    readonly successRedirectUrl: string,
    readonly failureRedirectUrl: string,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface DisabledTarget extends Target {
  isEnabled: true
}

export interface EnabledTarget extends Target {
  isEnabled: true
}
