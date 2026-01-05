import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  FullCampaignModel,
  Logger,
  LOGGER,
  testCampaignModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'
import { rawCampaignSchema, rawFullCampaignSchema } from './campaign.schemas.js'

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

    this.validator.addSchemas({
      'database-raw-campaign': rawCampaignSchema,
      'database-raw-full-campaign': rawFullCampaignSchema
    })

    this.logger.debug(`CampaignRepository initialized`)
  }

  async create(
    campaignId: string,
    mirrorDomain: string,
    description: string,
    landingUpgradePath: string,
    landingUpgradeParam: string,
    landingRedirectorParam: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<CampaignModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.campaign.create_campaign(
          this.options.prefix,
          campaignId,
          mirrorDomain,
          description,
          landingUpgradePath,
          landingUpgradeParam,
          landingRedirectorParam,
          sessionCookieName,
          sessionExpire,
          newSessionExpire,
          messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, campaignId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { campaign: model })

      return model
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, mirrorDomain })
    }
  }

  async read(campaignId: string): Promise<FullCampaignModel | null> {
    try {
      const rawFullModel = await this.connection.campaign.read_full_campaign(
        this.options.prefix,
        campaignId
      )

      return this.buildFullModel(rawFullModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId })
    }
  }

  async update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined
  ): Promise<CampaignModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.campaign.update_campaign(
          this.options.prefix,
          campaignId,
          description,
          sessionExpire,
          newSessionExpire,
          messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, campaignId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { campaign: model })

      return model
    } catch (error) {
      this.raiseError(error, 'update', { campaignId })
    }
  }

  async delete(campaignId: string): Promise<CampaignModel> {
    try {
      const [rawModel, statusReply] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, campaignId),

        this.connection.campaign.delete_campaign(this.options.prefix, campaignId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { campaign: model })

      return model
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId })
    }
  }

  async list(): Promise<CampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', null)
    }
  }

  protected buildModel(rawModel: unknown): CampaignModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawCampaign>('database-raw-campaign', rawModel)

    return {
      campaignId: rawModel.campaign_id,
      mirrorDomain: rawModel.mirror_domain,
      sessionCount: rawModel.session_count,
      messageCount: rawModel.message_count,
      createdAt: new Date(rawModel.created_at),
      updatedAt: new Date(rawModel.updated_at)
    }
  }

  protected buildModelStrict(rawModel: unknown): CampaignModel {
    const model = this.buildModel(rawModel)

    if (!testCampaignModel(model)) {
      throw new DatabaseError(`Campaign unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return model
  }

  protected buildFullModel(rawFullModel: unknown): FullCampaignModel | null {
    if (rawFullModel === null) {
      return null
    }

    this.validateRawData<RawFullCampaign>('database-raw-full-campaign', rawFullModel)

    return {
      campaignId: rawFullModel.campaign_id,
      mirrorDomain: rawFullModel.mirror_domain,
      description: rawFullModel.description,
      landingUpgradePath: rawFullModel.landing_upgrade_path,
      landingUpgradeParam: rawFullModel.landing_upgrade_param,
      landingRedirectorParam: rawFullModel.landing_redirector_param,
      sessionCookieName: rawFullModel.session_cookie_name,
      sessionExpire: rawFullModel.session_expire,
      newSessionExpire: rawFullModel.new_session_expire,
      messageExpire: rawFullModel.message_expire,
      proxyCount: rawFullModel.proxy_count,
      targetCount: rawFullModel.target_count,
      redirectorCount: rawFullModel.redirector_count,
      lureCount: rawFullModel.lure_count,
      sessionCount: rawFullModel.session_count,
      messageCount: rawFullModel.message_count,
      createdAt: new Date(rawFullModel.created_at),
      updatedAt: new Date(rawFullModel.updated_at)
    }
  }

  protected buildCollection(rawCollection: unknown): CampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(testCampaignModel)
  }
}
