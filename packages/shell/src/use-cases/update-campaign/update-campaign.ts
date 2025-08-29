export interface UpdateCampaignDto {
  description: string | null | undefined
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
