export class Campaign {
  constructor(
    readonly description: string,
    readonly landingSecret: string,
    readonly landingAuthPath: string,
    readonly landingAuthParam: string,
    readonly landingLureParam: string,
    readonly sessionCookieName: string,
    readonly sessionExpire: number,
    readonly newSessionExpire: number,
    readonly sessionLimit: number,
    readonly sessionEmergeIdleTime: number,
    readonly sessionEmergeLimit: number,
    readonly messageExpire: number,
    readonly messageLimit: number,
    readonly messageEmergeIdleTime: number,
    readonly messageEmergeLimit: number,
    readonly messageLockExpire: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly proxyCount: number,
    readonly targetCount: number,
    readonly redirectorCount: number,
    readonly lureCount: number,
    readonly sessionCount: number,
    readonly messageCount: number
  ) {}
}
