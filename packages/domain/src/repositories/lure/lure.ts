import { DisabledLureModel, EnabledLureModel, LureModel } from '../../models/index.js'

export interface CreateLureModel {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
}

export interface ReadLureModel {
  campaignId: string
  lureId: string
}

export interface ReadLurePathModel {
  campaignId: string
  path: string
}

export interface SwitchLureModel {
  campaignId: string
  lureId: string
}

export interface DeleteLureModel {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
}

export interface ListLureModels {
  campaignId: string
}

export interface LureRepository {
  create(data: CreateLureModel): Promise<DisabledLureModel>
  read(data: ReadLureModel): Promise<LureModel | null>
  readPath(data: ReadLurePathModel): Promise<EnabledLureModel | null>
  enable(data: SwitchLureModel): Promise<EnabledLureModel>
  disable(data: SwitchLureModel): Promise<DisabledLureModel>
  delete(data: DeleteLureModel): Promise<DisabledLureModel>
  list(data: ListLureModels): Promise<LureModel[] | null>
}

export const LURE_REPOSITORY = Symbol('LureRepository')
