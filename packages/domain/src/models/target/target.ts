export const TARGET_SUB_ROOT = '.'

export class TargetModel {
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
    //readonly analyzeHandler: string,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface DisabledTargetModel extends TargetModel {
  isEnabled: true
}

export interface EnabledTargetModel extends TargetModel {
  isEnabled: true
}
