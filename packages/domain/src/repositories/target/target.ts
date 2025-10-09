import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '../../models/index.js'

export interface CreateTargetModel {
  campaignId: string
  targetId: string
  isLanding: boolean
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
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

export interface ReadTargetModel {
  campaignId: string
  targetId: string
}

export interface UpdateTargetModel {
  campaignId: string
  targetId: string
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

export interface SwitchTargetModel {
  campaignId: string
  targetId: string
}

export interface DeleteTargetModel {
  campaignId: string
  targetId: string
}

export interface ListTargetModels {
  campaignId: string
}

export interface TargetRepository {
  create(data: CreateTargetModel): Promise<DisabledTargetModel>
  read(data: ReadTargetModel): Promise<TargetModel | null>
  readEnabled(data: ReadTargetModel): Promise<EnabledTargetModel | null>
  update(data: UpdateTargetModel): Promise<DisabledTargetModel>
  enable(data: SwitchTargetModel): Promise<EnabledTargetModel>
  disable(data: SwitchTargetModel): Promise<DisabledTargetModel>
  delete(data: DeleteTargetModel): Promise<DisabledTargetModel>
  list(data: ListTargetModels): Promise<TargetModel[] | null>
  listEnabled(data: ListTargetModels): Promise<EnabledTargetModel[] | null>
}

export const TARGET_REPOSITORY = Symbol('TargetRepository')
