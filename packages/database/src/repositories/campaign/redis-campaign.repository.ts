import {
  CampaignModel,
  CampaignRepository,
  Config,
  DatabaseError,
  Logger,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertCampaign,
  buildCampaignCollection,
  buildCampaignModel,
  guardCampaign
} from './campaign.utils.js'

export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'campaign')
  }

  async create(
    id: string,
    description: string,
    landingSecret: string,
    landingAuthPath: string,
    landingAuthParam: string,
    landingLureParam: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<CampaignModel> {
    try {
      const [status, rawCampaign] = await Promise.all([
        this.connection.campaign.create_campaign(
          this.options.prefix,
          id,
          description,
          landingSecret,
          landingAuthPath,
          landingAuthParam,
          landingLureParam,
          sessionCookieName,
          sessionExpire,
          newSessionExpire,
          messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const campaign = buildCampaignModel(rawCampaign)

        assertCampaign(campaign)

        return campaign
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', { id })
    }
  }

  async read(id: string): Promise<CampaignModel | null> {
    try {
      const rawCampaign = await this.connection.campaign.read_campaign(this.options.prefix, id)

      return buildCampaignModel(rawCampaign)
    } catch (error) {
      this.exceptionFilter(error, 'read', { id })
    }
  }

  async update(
    id: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined
  ): Promise<CampaignModel> {
    try {
      const [status, rawCampaign] = await Promise.all([
        this.connection.campaign.update_campaign(
          this.options.prefix,
          id,
          description,
          sessionExpire,
          newSessionExpire,
          messageExpire
        ),

        this.connection.campaign.read_campaign(this.options.prefix, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const campaign = buildCampaignModel(rawCampaign)

        assertCampaign(campaign)

        return campaign
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'update', { id })
    }
  }

  async delete(id: string): Promise<CampaignModel> {
    try {
      const [rawCampaign, status] = await Promise.all([
        this.connection.campaign.read_campaign(this.options.prefix, id),

        this.connection.campaign.delete_campaign(this.options.prefix, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const campaign = buildCampaignModel(rawCampaign)

        assertCampaign(campaign)

        return campaign
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'delete', { id })
    }
  }

  async list(): Promise<CampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      const rawCampaigns = await Promise.all(
        index.map((id) => this.connection.campaign.read_campaign(this.options.prefix, id))
      )

      return buildCampaignCollection(rawCampaigns).filter(guardCampaign)
    } catch (error) {
      this.exceptionFilter(error, 'list', {})
    }
  }
}
