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
      const [statusReply, rawValue] = await Promise.all([
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

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildCampaignModel(rawValue)

      if (!testCampaignModel(model)) {
        throw new DatabaseError(`Campaign lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { campaign: model })

      return model
    } catch (error) {
      this.handleException(error, 'create', { campaignId, mirrorDomain })
    }
  }

  async read(campaignId: string): Promise<FullCampaignModel | null> {
    try {
      const rawValue = await this.connection.campaign.read_full_campaign(
        this.options.prefix,
        campaignId
      )

      return this.buildFullCampaignModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId })
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
      const [statusReply, rawValue] = await Promise.all([
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

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildCampaignModel(rawValue)

      if (!testCampaignModel(model)) {
        throw new DatabaseError(`Campaign lost on update`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { campaign: model })

      return model
    } catch (error) {
      this.handleException(error, 'update', { campaignId })
    }
  }

  async delete(campaignId: string): Promise<CampaignModel> {
    try {
      const [rawValue, statusReply] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, campaignId),

        this.connection.campaign.delete_campaign(this.options.prefix, campaignId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildCampaignModel(rawValue)

      if (!testCampaignModel(model)) {
        throw new DatabaseError(`Campaign lost on delete`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { campaign: model })

      return model
    } catch (error) {
      this.handleException(error, 'delete', { campaignId })
    }
  }

  async list(): Promise<CampaignModel[]> {
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
      this.handleException(error, 'list', null)
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
      landingUpgradePath: rawValue.landing_upgrade_path,
      landingUpgradeParam: rawValue.landing_upgrade_param,
      landingRedirectorParam: rawValue.landing_redirector_param,
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
      throw new DatabaseError(`RawCampaign validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected validateRawFullCampaign(value: unknown): asserts value is RawFullCampaign {
    try {
      this.validator.assertSchema<RawFullCampaign>('database-raw-full-campaign', value)
    } catch (error) {
      throw new DatabaseError(`RawFullCampaign validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
