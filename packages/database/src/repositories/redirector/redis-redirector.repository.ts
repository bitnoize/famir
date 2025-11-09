import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateRedirectorModel,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteRedirectorModel,
  ListRedirectorModels,
  Logger,
  LOGGER,
  ReadRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  UpdateRedirectorModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertModel, buildCollection, buildModel, guardModel } from './redirector.utils.js'

export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      REDIRECTOR_REPOSITORY,
      (c) =>
        new RedisRedirectorRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<DatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
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

    this.logger.debug(`RedirectorRepository initialized`)
  }

  async create(data: CreateRedirectorModel): Promise<RedirectorModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.redirector.create_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId,
          data.page
        ),

        this.connection.redirector.read_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        )
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.handleException(error, 'create', data)
    }
  }

  async read(data: ReadRedirectorModel): Promise<RedirectorModel | null> {
    try {
      const raw = await this.connection.redirector.read_redirector(
        this.options.prefix,
        data.campaignId,
        data.redirectorId
      )

      return buildModel(raw)
    } catch (error) {
      this.handleException(error, 'read', data)
    }
  }

  async update(data: UpdateRedirectorModel): Promise<RedirectorModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.redirector.update_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId,
          data.page
        ),

        this.connection.redirector.read_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        )
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.handleException(error, 'update', data)
    }
  }

  async delete(data: DeleteRedirectorModel): Promise<RedirectorModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.redirector.read_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        ),

        this.connection.redirector.delete_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        )
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.handleException(error, 'delete', data)
    }
  }

  async list(data: ListRedirectorModels): Promise<RedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        data.campaignId
      )

      if (!index) {
        return null
      }

      const raws = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(
            this.options.prefix,
            data.campaignId,
            redirectorId
          )
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.handleException(error, 'list', data)
    }
  }
}
