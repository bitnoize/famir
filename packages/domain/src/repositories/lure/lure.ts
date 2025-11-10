import { DisabledLureModel, EnabledLureModel, LureModel } from '../../models/index.js'

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

export interface LureRepository {
  createLure(data: CreateLureData): Promise<DisabledLureModel>
  readLure(data: ReadLureData): Promise<LureModel | null>
  readLurePath(data: ReadLurePathData): Promise<EnabledLureModel | null>
  enableLure(data: SwitchLureData): Promise<EnabledLureModel>
  disableLure(data: SwitchLureData): Promise<DisabledLureModel>
  deleteLure(data: DeleteLureData): Promise<DisabledLureModel>
  listLures(data: ListLuresData): Promise<LureModel[] | null>
}

export const LURE_REPOSITORY = Symbol('LureRepository')
