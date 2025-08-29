import { EnabledLure, Lure } from '../../models/index.js'

export interface LureRepository {
  create(id: string, path: string, redirectorId: string): Promise<void>
  read(id: string): Promise<Lure | null>
  readPath(path: string): Promise<EnabledLure | null>
  enable(id: string): Promise<void>
  disable(id: string): Promise<void>
  delete(id: string, path: string, redirectorId: string): Promise<void>
  list(): Promise<Lure[] | null>
}
