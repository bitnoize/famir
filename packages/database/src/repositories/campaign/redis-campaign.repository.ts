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
  FullCampaignModel,
  Logger,
  LOGGER,
  ReadCampaignData,
  testCampaignModel,
  UpdateCampaignData,
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
  }

  async createCampaign(data: CreateCampaignData): Promise<CampaignModel> {
    try {
      const [status, rawValue] = await Promise.all([
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

      const campaignModel = this.buildCampaignModel(rawValue)

      if (!testCampaignModel(campaignModel)) {
        throw new DatabaseError(`CampaignModel lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { campaignModel })

      return campaignModel
    } catch (error) {
      this.handleException(error, 'createCampaign', data)
    }
  }

  async readCampaign(data: ReadCampaignData): Promise<FullCampaignModel | null> {
    try {
      const rawValue = await this.connection.campaign.read_full_campaign(
        this.options.prefix,
        data.campaignId
      )

      return this.buildFullCampaignModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readCampaign', data)
    }
  }

  async updateCampaign(data: UpdateCampaignData): Promise<CampaignModel> {
    try {
      const [status, rawValue] = await Promise.all([
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

      const campaignModel = this.buildCampaignModel(rawValue)

      if (!testCampaignModel(campaignModel)) {
        throw new DatabaseError(`CampaignModel lost on update`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { campaignModel })

      return campaignModel
    } catch (error) {
      this.handleException(error, 'updateCampaign', data)
    }
  }

  async deleteCampaign(data: DeleteCampaignData): Promise<CampaignModel> {
    try {
      const [rawValue, status] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, data.campaignId),

        this.connection.campaign.delete_campaign(this.options.prefix, data.campaignId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const campaignModel = this.buildCampaignModel(rawValue)

      if (!testCampaignModel(campaignModel)) {
        throw new DatabaseError(`CampaignModel lost on delete`, {
          code: 'INTERNAL_ERROR'
        })
      }

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

      const rawValues = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildCampaignCollection(rawValues).filter(testCampaignModel)
    } catch (error) {
      this.handleException(error, 'listCampaigns', null)
    }
  }

  protected buildCampaignModel(rawValue: unknown): CampaignModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawCampaign(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      mirrorDomain: rawValue.mirror_domain,
      sessionCount: rawValue.session_count,
      messageCount: rawValue.message_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildFullCampaignModel(rawValue: unknown): FullCampaignModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawFullCampaign(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      mirrorDomain: rawValue.mirror_domain,
      description: rawValue.description,
      landingAuthPath: rawValue.landing_auth_path,
      landingAuthParam: rawValue.landing_auth_param,
      landingLureParam: rawValue.landing_lure_param,
      sessionCookieName: rawValue.session_cookie_name,
      sessionExpire: rawValue.session_expire,
      newSessionExpire: rawValue.new_session_expire,
      messageExpire: rawValue.message_expire,
      proxyCount: rawValue.proxy_count,
      targetCount: rawValue.target_count,
      redirectorCount: rawValue.redirector_count,
      lureCount: rawValue.lure_count,
      sessionCount: rawValue.session_count,
      messageCount: rawValue.message_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildCampaignCollection(rawValues: unknown): Array<CampaignModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildCampaignModel(rawValue))
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

  protected validateRawFullCampaign(value: unknown): asserts value is RawFullCampaign {
    try {
      this.validator.assertSchema<RawFullCampaign>('database-raw-full-campaign', value)
    } catch (error) {
      throw new DatabaseError(`RawFullCampaign validation failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
