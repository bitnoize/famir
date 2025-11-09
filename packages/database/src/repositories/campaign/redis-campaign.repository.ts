import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  Config,
  CONFIG,
  CreateCampaignModel,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteCampaignModel,
  Logger,
  LOGGER,
  ReadCampaignModel,
  UpdateCampaignModel,
  Validator,
  VALIDATOR
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

    this.logger.debug(`CampaignRepository initialized`)
  }

  async create(data: CreateCampaignModel): Promise<CampaignModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.campaign.create_campaign(
          this.options.prefix,
          data.campaignId,
          data.mirrorDomain,
          data.description,
          data.landingAuthPath,
          data.landingAuthParam,
          data.landingLureParam,
          data.sessionCookieName,
          data.sessionExpire,
          data.newSessionExpire,
          data.messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, data.campaignId)
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

  async read(data: ReadCampaignModel): Promise<CampaignModel | null> {
    try {
      const raw = await this.connection.campaign.read_campaign(this.options.prefix, data.campaignId)

      return buildModel(raw)
    } catch (error) {
      this.handleException(error, 'read', data)
    }
  }

  async update(data: UpdateCampaignModel): Promise<CampaignModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.campaign.update_campaign(
          this.options.prefix,
          data.campaignId,
          data.description,
          data.sessionExpire,
          data.newSessionExpire,
          data.messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, data.campaignId)
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

  async delete(data: DeleteCampaignModel): Promise<CampaignModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, data.campaignId),

        this.connection.campaign.delete_campaign(this.options.prefix, data.campaignId)
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

  async list(): Promise<CampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      const raws = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_campaign(this.options.prefix, campaignId)
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.handleException(error, 'list', null)
    }
  }
}
