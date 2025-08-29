import { Campaign } from '../../models/index.js'

export interface CampaignRepository {
  create(
    description: string,
    landingSecret: string,
    landingAuthPath: string,
    landingAuthParam: string,
    landingLureParam: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    sessionLimit: number,
    sessionEmergeIdleTime: number,
    sessionEmergeLimit: number,
    messageExpire: number,
    messageLimit: number,
    messageEmergeIdleTime: number,
    messageEmergeLimit: number,
    messageLockExpire: number
  ): Promise<void>
  read(): Promise<Campaign | null>
  update(
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    sessionLimit: number | null | undefined,
    sessionEmergeIdleTime: number | null | undefined,
    sessionEmergeLimit: number | null | undefined,
    messageExpire: number | null | undefined,
    messageLimit: number | null | undefined,
    messageEmergeIdleTime: number | null | undefined,
    messageEmergeLimit: number | null | undefined,
    messageLockExpire: number | null | undefined
  ): Promise<void>
  delete(): Promise<void>
}
