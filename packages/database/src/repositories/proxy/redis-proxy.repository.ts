import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateProxyData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteProxyData,
  DisabledProxyModel,
  EnabledProxyModel,
  ListProxiesData,
  Logger,
  LOGGER,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReadProxyData,
  SwitchProxyData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertDisabledModel,
  assertEnabledModel,
  buildCollection,
  buildModel,
  guardEnabledModel,
  guardModel
} from './proxy.utils.js'

export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyRepository>(
      PROXY_REPOSITORY,
      (c) =>
        new RedisProxyRepository(
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
    super(validator, config, logger, connection, 'proxy')
  }

  async create(data: CreateProxyData): Promise<DisabledProxyModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.proxy.create_proxy(this.options.prefix, data.campaignId, data.id, data.url),

        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', data)
    }
  }

  async read(data: ReadProxyData): Promise<ProxyModel | null> {
    try {
      const raw = await this.connection.proxy.read_proxy(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async readEnabled(data: ReadProxyData): Promise<EnabledProxyModel | null> {
    try {
      const raw = await this.connection.proxy.read_proxy(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', data)
    }
  }

  async enable(data: SwitchProxyData): Promise<EnabledProxyModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.proxy.enable_proxy(this.options.prefix, data.campaignId, data.id),

        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertEnabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'enable', data)
    }
  }

  async disable(data: SwitchProxyData): Promise<DisabledProxyModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.proxy.disable_proxy(this.options.prefix, data.campaignId, data.id),

        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'disable', data)
    }
  }

  async delete(data: DeleteProxyData): Promise<DisabledProxyModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.id),

        this.connection.proxy.delete_proxy(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'delete', data)
    }
  }

  async list(data: ListProxiesData): Promise<ProxyModel[] | null> {
    try {
      const index = await this.connection.proxy.read_proxy_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) =>
          this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, id)
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', data)
    }
  }
}
