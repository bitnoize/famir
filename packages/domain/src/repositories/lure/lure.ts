import { LureModel } from '../../models/index.js'

export interface CreateLureData {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
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
}

export interface DeleteLureData {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
}

export interface ListLuresData {
  campaignId: string
}

export const LURE_REPOSITORY = Symbol('LureRepository')

export interface LureRepository {
  createLure(data: CreateLureData): Promise<LureModel>
  readLure(data: ReadLureData): Promise<LureModel | null>
  readLurePath(data: ReadLurePathData): Promise<LureModel | null>
  enableLure(data: SwitchLureData): Promise<LureModel>
  disableLure(data: SwitchLureData): Promise<LureModel>
  deleteLure(data: DeleteLureData): Promise<LureModel>
  listLures(data: ListLuresData): Promise<LureModel[] | null>
}
