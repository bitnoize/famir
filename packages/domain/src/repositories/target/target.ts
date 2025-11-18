import { FullTargetModel, TargetModel } from '../../models/index.js'

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
  connectTimeout: number
  regularTimeout: number
  streamingTimeout: number
  requestDataLimit: number
  responseDataLimit: number
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
  connectTimeout: number | null | undefined
  regularTimeout: number | null | undefined
  streamingTimeout: number | null | undefined
  requestDataLimit: number | null | undefined
  responseDataLimit: number | null | undefined
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

export interface ActionTargetLabelData {
  campaignId: string
  targetId: string
  label: string
}

export interface DeleteTargetData {
  campaignId: string
  targetId: string
}

export interface ListTargetsData {
  campaignId: string
}

export const TARGET_REPOSITORY = Symbol('TargetRepository')

export interface TargetRepository {
  createTarget(data: CreateTargetData): Promise<TargetModel>
  readTarget(data: ReadTargetData): Promise<FullTargetModel | null>
  updateTarget(data: UpdateTargetData): Promise<TargetModel>
  enableTarget(data: SwitchTargetData): Promise<TargetModel>
  disableTarget(data: SwitchTargetData): Promise<TargetModel>
  appendTargetLabel(data: ActionTargetLabelData): Promise<TargetModel>
  removeTargetLabel(data: ActionTargetLabelData): Promise<TargetModel>
  deleteTarget(data: DeleteTargetData): Promise<TargetModel>
  listTargets(data: ListTargetsData): Promise<TargetModel[] | null>
}
