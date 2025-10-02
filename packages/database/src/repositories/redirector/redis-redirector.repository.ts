import { DIContainer } from '@famir/common'
import {
  Config,
  CreateRedirectorData,
  DatabaseConnector,
  DatabaseError,
  DeleteRedirectorData,
  ListRedirectorsData,
  Logger,
  ReadRedirectorData,
  RedirectorModel,
  RedirectorRepository,
  UpdateRedirectorData,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertModel, buildCollection, buildModel, guardModel } from './redirector.utils.js'

export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  static inject<C extends DatabaseConfig>(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      'RedirectorRepository',
      (c) =>
        new RedisRedirectorRepository(
          c.resolve<Validator>('Validator'),
          c.resolve<Config<C>>('Config'),
          c.resolve<Logger>('Logger'),
          c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'redirector')
  }

  async create(data: CreateRedirectorData): Promise<RedirectorModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.redirector.create_redirector(
          this.options.prefix,
          data.campaignId,
          data.id,
          data.page
        ),

        this.connection.redirector.read_redirector(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', data)
    }
  }

  async read(data: ReadRedirectorData): Promise<RedirectorModel | null> {
    try {
      const raw = await this.connection.redirector.read_redirector(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async update(data: UpdateRedirectorData): Promise<RedirectorModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.redirector.update_redirector(
          this.options.prefix,
          data.campaignId,
          data.id,
          data.page
        ),

        this.connection.redirector.read_redirector(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'update', data)
    }
  }

  async delete(data: DeleteRedirectorData): Promise<RedirectorModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.redirector.read_redirector(this.options.prefix, data.campaignId, data.id),

        this.connection.redirector.delete_redirector(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'delete', data)
    }
  }

  async list(data: ListRedirectorsData): Promise<RedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) =>
          this.connection.redirector.read_redirector(this.options.prefix, data.campaignId, id)
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', data)
    }
  }
}
