import { Redirector, RedirectorRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  buildRedirectorCollection,
  buildRedirectorModel,
  guardRedirector
} from './redirector.utils.js'

export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  constructor(validator: Validator, logger: Logger, connection: RedisDatabaseConnection) {
    super(validator, logger, connection, 'redirector')
  }

  async create(id: string, page: string): Promise<void> {
    try {
      const status = await this.connection.redirector.create_redirector(id, page)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        id,
        page
      })
    }
  }

  async read(id: string): Promise<Redirector | null> {
    try {
      const rawRedirector = await this.connection.redirector.read_redirector(id)

      const redirector = buildRedirectorModel(rawRedirector)

      return guardRedirector(redirector) ? redirector : null
    } catch (error) {
      this.exceptionFilter(error, 'read', { id })
    }
  }

  async update(id: string, page: string | null | undefined): Promise<void> {
    try {
      const status = await this.connection.redirector.update_redirector(id, page)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        id,
        page
      })
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const status = await this.connection.redirector.delete_redirector(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { id })
    }
  }

  async list(): Promise<Redirector[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index()

      if (index === null) {
        return null
      }

      const rawRedirectors = await Promise.all(
        index.map((id) => this.connection.redirector.read_redirector(id))
      )

      return buildRedirectorCollection(rawRedirectors).filter(guardRedirector)
    } catch (error) {
      this.exceptionFilter(error, 'list')
    }
  }
}
