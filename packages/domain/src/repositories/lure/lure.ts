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
  create(data: CreateLureData): Promise<DisabledLureModel>
  read(data: ReadLureData): Promise<LureModel | null>
  readPath(data: ReadLurePathData): Promise<EnabledLureModel | null>
  enable(data: SwitchLureData): Promise<EnabledLureModel>
  disable(data: SwitchLureData): Promise<DisabledLureModel>
  delete(data: DeleteLureData): Promise<DisabledLureModel>
  list(data: ListLuresData): Promise<LureModel[] | null>
}

export const LURE_REPOSITORY = Symbol('LureRepository')
