export interface UpdateCampaignData {
  id: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}
