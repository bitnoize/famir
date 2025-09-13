import { Campaign, CampaignRepository, RepositoryContainer } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertCampaign, buildCampaignModel } from './campaign.utils.js'

export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  constructor(validator: Validator, logger: Logger, connection: RedisDatabaseConnection) {
    super(validator, logger, connection, 'campaign')
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
  ): Promise<RepositoryContainer<Campaign>> {
    try {
      const [status, rawCampaign] = await Promise.all([
        this.connection.campaign.create_campaign(
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

        this.connection.campaign.read_campaign(id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const campaign = buildCampaignModel(rawCampaign)

        assertCampaign(campaign)

        return [true, campaign, code, message]
      }

      const isKnownError = ['CONFLICT'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', {
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
      })
    }
  }

  async read(id: string): Promise<Campaign | null> {
    try {
      const rawCampaign = await this.connection.campaign.read_campaign(id)

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
  ): Promise<RepositoryContainer<Campaign>> {
    try {
      const [status, rawCampaign] = await Promise.all([
        this.connection.campaign.update_campaign(
          id,
          description,
          sessionExpire,
          newSessionExpire,
          messageExpire
        ),

        this.connection.campaign.read_campaign(id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const campaign = buildCampaignModel(rawCampaign)

        assertCampaign(campaign)

        return [true, campaign, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        id,
        description,
        sessionExpire,
        newSessionExpire,
        messageExpire
      })
    }
  }

  async delete(id: string): Promise<RepositoryContainer<Campaign>> {
    try {
      const [rawCampaign, status] = await Promise.all([
        this.connection.campaign.read_campaign(id),

        this.connection.campaign.delete_campaign(id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const campaign = buildCampaignModel(rawCampaign)

        assertCampaign(campaign)

        return [true, campaign, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { id })
    }
  }
}
