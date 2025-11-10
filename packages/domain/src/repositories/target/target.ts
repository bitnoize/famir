import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '../../models/index.js'

export interface CreateTargetData {
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
  marks: string[]
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
  targetId: string
}

export interface UpdateTargetData {
  campaignId: string
  targetId: string
  marks: string[] | null | undefined
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
  targetId: string
}

export interface DeleteTargetData {
  campaignId: string
  targetId: string
}

export interface ListTargetsData {
  campaignId: string
}

export interface TargetRepository {
  createTarget(data: CreateTargetData): Promise<DisabledTargetModel>
  readTarget(data: ReadTargetData): Promise<TargetModel | null>
  readEnabledTarget(data: ReadTargetData): Promise<EnabledTargetModel | null>
  updateTarget(data: UpdateTargetData): Promise<TargetModel>
  enableTarget(data: SwitchTargetData): Promise<EnabledTargetModel>
  disableTarget(data: SwitchTargetData): Promise<DisabledTargetModel>
  deleteTarget(data: DeleteTargetData): Promise<DisabledTargetModel>
  listTargets(data: ListTargetsData): Promise<TargetModel[] | null>
  listEnabledTargets(data: ListTargetsData): Promise<EnabledTargetModel[] | null>
}

export const TARGET_REPOSITORY = Symbol('TargetRepository')
