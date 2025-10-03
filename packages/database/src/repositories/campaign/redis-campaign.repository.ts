import { DIContainer, randomSecret } from '@famir/common'
import {
  CampaignModel,
  CampaignRepository,
  Config,
  CreateCampaignData,
  DatabaseConnector,
  DatabaseError,
  DeleteCampaignData,
  Logger,
  ReadCampaignData,
  UpdateCampaignData,
  Validator,
  VALIDATOR,
  CONFIG,
  LOGGER,
  DATABASE_CONNECTOR,
  CAMPAIGN_REPOSITORY
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertModel, buildCollection, buildModel, guardModel } from './campaign.utils.js'

export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignRepository>(
      CAMPAIGN_REPOSITORY,
      (c) =>
        new RedisCampaignRepository(
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
    super(validator, config, logger, connection, 'campaign')
  }

  async create(data: CreateCampaignData): Promise<CampaignModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.campaign.create_campaign(
          this.options.prefix,
          data.id,
          data.description ?? 'Default campaign',
          data.landingSecret ?? randomSecret(),
          data.landingAuthPath ?? '/fake-auth',
          data.landingAuthParam ?? 'data',
          data.landingLureParam ?? 'data',
          data.sessionCookieName ?? 'fake-sess',
          data.sessionExpire ?? 24 * 3600 * 1000,
          data.newSessionExpire ?? 300 * 1000,
          data.messageExpire ?? 3600 * 1000
        ),

        this.connection.campaign.read_campaign(this.options.prefix, data.id)
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

  async read(data: ReadCampaignData): Promise<CampaignModel | null> {
    try {
      const raw = await this.connection.campaign.read_campaign(this.options.prefix, data.id)

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async update(data: UpdateCampaignData): Promise<CampaignModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.campaign.update_campaign(
          this.options.prefix,
          data.id,
          data.description,
          data.sessionExpire,
          data.newSessionExpire,
          data.messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, data.id)
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

  async delete(data: DeleteCampaignData): Promise<CampaignModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, data.id),

        this.connection.campaign.delete_campaign(this.options.prefix, data.id)
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

  async list(): Promise<CampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      const raws = await Promise.all(
        index.map((id) => this.connection.campaign.read_campaign(this.options.prefix, id))
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', null)
    }
  }
}
