import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '../../models/index.js'

export interface CreateTargetData {
  campaignId: string
  id: string
  isLanding: boolean
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorDomain: string
  mirrorPort: number
  connectTimeout: number
  timeout: number
  mainPage: string
  notFoundPage: string
  faviconIco: string
  robotsTxt: string
  sitemapXml: string
  successRedirectUrl: string
  failureRedirectUrl: string
}

export interface ReadTargetData {
  campaignId: string
  id: string
}

export interface UpdateTargetData {
  campaignId: string
  id: string
  connectTimeout: number | null | undefined
  timeout: number | null | undefined
  mainPage: string | null | undefined
  notFoundPage: string | null | undefined
  faviconIco: string | null | undefined
  robotsTxt: string | null | undefined
  sitemapXml: string | null | undefined
  successRedirectUrl: string | null | undefined
  failureRedirectUrl: string | null | undefined
}

export interface SwitchTargetData {
  campaignId: string
  id: string
}

export interface DeleteTargetData {
  campaignId: string
  id: string
}

export interface ListTargetsData {
  campaignId: string
}

export interface TargetRepository {
  create(data: CreateTargetData): Promise<DisabledTargetModel>
  read(data: ReadTargetData): Promise<TargetModel | null>
  readEnabled(data: ReadTargetData): Promise<EnabledTargetModel | null>
  update(data: UpdateTargetData): Promise<DisabledTargetModel>
  enable(data: SwitchTargetData): Promise<EnabledTargetModel>
  disable(data: SwitchTargetData): Promise<DisabledTargetModel>
  delete(data: DeleteTargetData): Promise<DisabledTargetModel>
  list(data: ListTargetsData): Promise<TargetModel[] | null>
  listEnabled(data: ListTargetsData): Promise<EnabledTargetModel[] | null>
}
