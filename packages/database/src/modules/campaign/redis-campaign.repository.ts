import { DIContainer, randomIdent } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DATABASE_LOCK_TIMEOUT,
  DatabaseConnector,
  RedisDatabaseConfig,
  RedisDatabaseConnection,
} from '../../database.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'
import { CAMPAIGN_REPOSITORY, CampaignRepository, CampaignShare } from './campaign.js'
import { CampaignModel, FullCampaignModel } from './campaign.models.js'
import { campaignSchemas } from './campaign.schemas.js'

/**
 * Redis campaign repository implementation
 *
 * @category Campaign
 */
export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<CampaignRepository>(
      CAMPAIGN_REPOSITORY,
      (c) =>
        new RedisCampaignRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).getConnection<RedisDatabaseConnection>()
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
    cryptSecret: string,
    upgradeSessionPath: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.create_campaign(
        this.options.prefix,
        campaignId,
        mirrorDomain,
        description,
        cryptSecret,
        upgradeSessionPath,
        sessionCookieName,
        sessionExpire.toString(),
        newSessionExpire.toString(),
        messageExpire.toString(),
        Date.now().toString()
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId, mirrorDomain } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, mirrorDomain })
    }
  }

  async read(campaignId: string): Promise<CampaignModel | null> {
    try {
      const rawModel = await this.connection.campaign.read_campaign(this.options.prefix, campaignId)

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId })
    }
  }

  async readFull(campaignId: string): Promise<FullCampaignModel | null> {
    try {
      const rawModel = await this.connection.campaign.read_full_campaign(
        this.options.prefix,
        campaignId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'readFull', { campaignId })
    }
  }

  async readShare(): Promise<CampaignShare> {
    try {
      const [mirrorDomains, sessionCookieNames] = await Promise.all([
        this.connection.campaign.read_campaign_mirror_domains(this.options.prefix),
        this.connection.campaign.read_campaign_session_cookie_names(this.options.prefix),
      ])

      this.validateArrayStringsReply(mirrorDomains)
      this.validateArrayStringsReply(sessionCookieNames)

      return {
        mirrorDomains: mirrorDomains.sort(),
        sessionCookieNames: sessionCookieNames.sort(),
      }
    } catch (error) {
      this.raiseError(error, 'readShare', null)
    }
  }

  async lock(campaignId: string): Promise<string> {
    const lockSecret = randomIdent()

    try {
      const statusReply = await this.connection.campaign.lock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret,
        DATABASE_LOCK_TIMEOUT.toString()
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })

      return lockSecret
    } catch (error) {
      this.raiseError(error, 'lock', { campaignId })
    }
  }

  async unlock(campaignId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.unlock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
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
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.update_campaign(
        this.options.prefix,
        campaignId,
        description ?? null,
        sessionExpire != null ? sessionExpire.toString() : null,
        newSessionExpire != null ? newSessionExpire.toString() : null,
        messageExpire != null ? messageExpire.toString() : null,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
    } catch (error) {
      this.raiseError(error, 'update', { campaignId })
    }
  }

  async delete(campaignId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.delete_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
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

  async listFull(): Promise<FullCampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_full_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildFullCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'listFull', null)
    }
  }

  protected buildModel(rawModel: unknown): CampaignModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawCampaign>('database-raw-campaign', rawModel)

    return new CampaignModel(
      rawModel.campaign_id,
      rawModel.mirror_domain,
      !!rawModel.is_locked,
      rawModel.session_count,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  protected buildFullModel(rawModel: unknown): FullCampaignModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawFullCampaign>('database-raw-full-campaign', rawModel)

    return new FullCampaignModel(
      rawModel.campaign_id,
      rawModel.mirror_domain,
      rawModel.description,
      rawModel.crypt_secret,
      rawModel.upgrade_session_path,
      rawModel.session_cookie_name,
      rawModel.session_expire,
      rawModel.new_session_expire,
      rawModel.message_expire,
      !!rawModel.is_locked,
      rawModel.proxy_count,
      rawModel.target_count,
      rawModel.redirector_count,
      rawModel.lure_count,
      rawModel.session_count,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  protected buildCollection(rawCollection: unknown): CampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(CampaignModel.isNotNull)
  }

  protected buildFullCollection(rawCollection: unknown): FullCampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(CampaignModel.isNotNull)
  }
}
