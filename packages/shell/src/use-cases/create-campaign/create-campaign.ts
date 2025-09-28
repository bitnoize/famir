export interface CreateCampaignData {
  id: string
  description: string | null | undefined
  landingSecret: string | null | undefined
  landingAuthPath: string | null | undefined
  landingAuthParam: string | null | undefined
  landingLureParam: string | null | undefined
  sessionCookieName: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}
