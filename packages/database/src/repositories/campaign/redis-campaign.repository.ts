import { Campaign, CampaignRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { buildCampaignModel, guardCampaign } from './campaign.utils.js'

export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  constructor(validator: Validator, logger: Logger, connection: RedisDatabaseConnection) {
    super(validator, logger, connection, 'campaign')
  }

  async create(
    description: string,
    landingSecret: string,
    landingAuthPath: string,
    landingAuthParam: string,
    landingLureParam: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    sessionLimit: number,
    sessionEmergeIdleTime: number,
    sessionEmergeLimit: number,
    messageExpire: number,
    messageLimit: number,
    messageEmergeIdleTime: number,
    messageEmergeLimit: number,
    messageLockExpire: number
  ): Promise<void> {
    try {
      const status = await this.connection.campaign.create_campaign(
        description,
        landingSecret,
        landingAuthPath,
        landingAuthParam,
        landingLureParam,
        sessionCookieName,
        sessionExpire,
        newSessionExpire,
        sessionLimit,
        sessionEmergeIdleTime,
        sessionEmergeLimit,
        messageExpire,
        messageLimit,
        messageEmergeIdleTime,
        messageEmergeLimit,
        messageLockExpire
      )

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        description,
        landingSecret,
        landingAuthPath,
        landingAuthParam,
        landingLureParam,
        sessionCookieName,
        sessionExpire,
        newSessionExpire,
        sessionLimit,
        sessionEmergeIdleTime,
        sessionEmergeLimit,
        messageExpire,
        messageLimit,
        messageEmergeIdleTime,
        messageEmergeLimit,
        messageLockExpire
      })
    }
  }

  async read(): Promise<Campaign | null> {
    try {
      const rawCampaign = await this.connection.campaign.read_campaign()

      const campaign = buildCampaignModel(rawCampaign)

      return guardCampaign(campaign) ? campaign : null
    } catch (error) {
      this.exceptionFilter(error, 'read')
    }
  }

  async update(
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    sessionLimit: number | null | undefined,
    sessionEmergeIdleTime: number | null | undefined,
    sessionEmergeLimit: number | null | undefined,
    messageExpire: number | null | undefined,
    messageLimit: number | null | undefined,
    messageEmergeIdleTime: number | null | undefined,
    messageEmergeLimit: number | null | undefined,
    messageLockExpire: number | null | undefined
  ): Promise<void> {
    try {
      const status = await this.connection.campaign.update_campaign(
        description,
        sessionExpire,
        newSessionExpire,
        sessionLimit,
        sessionEmergeIdleTime,
        sessionEmergeLimit,
        messageExpire,
        messageLimit,
        messageEmergeIdleTime,
        messageEmergeLimit,
        messageLockExpire
      )

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        sessionExpire,
        newSessionExpire,
        sessionLimit,
        sessionEmergeIdleTime,
        sessionEmergeLimit,
        messageExpire,
        messageLimit,
        messageEmergeIdleTime,
        messageEmergeLimit,
        messageLockExpire
      })
    }
  }

  async delete(): Promise<void> {
    try {
      const status = await this.connection.campaign.delete_campaign()

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete')
    }
  }
}
