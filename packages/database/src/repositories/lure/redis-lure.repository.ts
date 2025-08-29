import { EnabledLure, Lure, LureRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { buildLureCollection, buildLureModel, guardEnabledLure, guardLure } from './lure.utils.js'

export class RedisLureRepository extends RedisBaseRepository implements LureRepository {
  constructor(validator: Validator, logger: Logger, connection: RedisDatabaseConnection) {
    super(validator, logger, connection, 'lure')
  }

  async create(id: string, path: string, redirectorId: string): Promise<void> {
    try {
      const status = await this.connection.lure.create_lure(id, path, redirectorId)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        id,
        path,
        redirectorId
      })
    }
  }

  async read(id: string): Promise<Lure | null> {
    try {
      const rawLure = await this.connection.lure.read_lure(id)

      const lure = buildLureModel(rawLure)

      return guardLure(lure) ? lure : null
    } catch (error) {
      this.exceptionFilter(error, 'read', { id })
    }
  }

  async readPath(path: string): Promise<EnabledLure | null> {
    try {
      const id = await this.connection.lure.read_lure_path(path)

      if (id === null) {
        return null
      }

      const rawLure = await this.connection.lure.read_lure(id)

      const lure = buildLureModel(rawLure)

      return guardEnabledLure(lure) ? lure : null
    } catch (error) {
      this.exceptionFilter(error, 'readPath', { path })
    }
  }

  async enable(id: string): Promise<void> {
    try {
      const status = await this.connection.lure.enable_lure(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'enable', { id })
    }
  }

  async disable(id: string): Promise<void> {
    try {
      const status = await this.connection.lure.disable_lure(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'disable', { id })
    }
  }

  async delete(id: string, path: string, redirectorId: string): Promise<void> {
    try {
      const status = await this.connection.lure.delete_lure(id, path, redirectorId)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', {
        id,
        path,
        redirectorId
      })
    }
  }

  async list(): Promise<Lure[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index()

      if (index === null) {
        return null
      }

      const rawLures = await Promise.all(index.map((id) => this.connection.lure.read_lure(id)))

      return buildLureCollection(rawLures).filter(guardLure)
    } catch (error) {
      this.exceptionFilter(error, 'list')
    }
  }
}
