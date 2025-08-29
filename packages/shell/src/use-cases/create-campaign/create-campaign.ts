export interface CreateCampaignDto {
  description: string | null | undefined
  landingSecret: string | null | undefined
  landingAuthPath: string | null | undefined
  landingAuthParam: string | null | undefined
  landingLureParam: string | null | undefined
  sessionCookieName: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  sessionLimit: number | null | undefined
  sessionEmergeIdleTime: number | null | undefined
  sessionEmergeLimit: number | null | undefined
  messageExpire: number | null | undefined
  messageLimit: number | null | undefined
  messageEmergeIdleTime: number | null | undefined
  messageEmergeLimit: number | null | undefined
  messageLockExpire: number | null | undefined
}
