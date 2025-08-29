import { Redirector } from '../../models/index.js'

export interface RedirectorRepository {
  create(id: string, page: string): Promise<void>
  read(id: string): Promise<Redirector | null>
  update(id: string, page: string | null | undefined): Promise<void>
  delete(id: string): Promise<void>
  list(): Promise<Redirector[] | null>
}
