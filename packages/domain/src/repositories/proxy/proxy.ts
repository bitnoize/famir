import { EnabledProxy, Proxy } from '../../models/index.js'

export interface ProxyRepository {
  create(id: string, url: string): Promise<void>
  read(id: string): Promise<Proxy | null>
  readEnabled(id: string): Promise<EnabledProxy | null>
  enable(id: string): Promise<void>
  disable(id: string): Promise<void>
  delete(id: string): Promise<void>
  list(): Promise<Proxy[] | null>
}
