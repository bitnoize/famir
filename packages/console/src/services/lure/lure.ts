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
