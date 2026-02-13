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
    readonly mirrorDomain: string,
    readonly mirrorPort: number,
    readonly labels: string[],
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  get donorProtocol(): string {
    return this.donorSecure ? 'https:' : 'http:'
  }

  get donorHostname(): string {
    return this.donorSub !== TARGET_SUB_ROOT
      ? [this.donorSub, this.donorDomain].join('.')
      : this.donorDomain
  }

  get donorHost(): string {
    if (
      (!this.donorSecure && this.donorPort === 80) ||
      (this.donorSecure && this.donorPort === 443)
    ) {
      return this.donorHostname
    } else {
      return [this.donorHostname, this.donorPort.toString()].join(':')
    }
  }

  get mirrorProtocol(): string {
    return this.mirrorSecure ? 'https:' : 'http:'
  }

  get mirrorHostname(): string {
    return this.mirrorSub !== TARGET_SUB_ROOT
      ? [this.mirrorSub, this.mirrorDomain].join('.')
      : this.mirrorDomain
  }

  get mirrorHost(): string {
    if (
      (!this.mirrorSecure && this.mirrorPort === 80) ||
      (this.mirrorSecure && this.mirrorPort === 443)
    ) {
      return this.mirrorHostname
    } else {
      return [this.mirrorHostname, this.mirrorPort.toString()].join(':')
    }
  }

  hasLabel(value: string): boolean {
    return this.labels.includes(value)
  }
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
    mirrorDomain: string,
    mirrorPort: number,
    labels: string[],
    readonly connectTimeout: number,
    readonly simpleTimeout: number,
    readonly streamTimeout: number,
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
      mirrorDomain,
      mirrorPort,
      labels,
      isEnabled,
      messageCount,
      createdAt,
      updatedAt
    )
  }
}

export interface EnabledTargetModel extends TargetModel {
  isEnabled: true
}

export interface EnabledFullTargetModel extends FullTargetModel {
  isEnabled: true
}
