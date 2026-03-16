export interface CreateLureData {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
  lockSecret: string
}

export interface ReadLureData {
  campaignId: string
  lureId: string
}

export interface ReadLurePathData {
  campaignId: string
  path: string
}

export interface SwitchLureData {
  campaignId: string
  lureId: string
  lockSecret: string
}

export interface DeleteLureData {
  campaignId: string
  lureId: string
  redirectorId: string
  lockSecret: string
}

export interface ListLuresData {
  campaignId: string
}

export interface LureUrlPayload {
  [key: string]: string | null | undefined
  back_url?: string | null | undefined
  og_title?: string | null | undefined
  og_description?: string | null | undefined
  og_image?: string | null | undefined
  og_url?: string | null | undefined
}

export interface MakeLureUrlData {
  campaignId: string
  targetId: string
  lureId: string
  payload: LureUrlPayload
}
