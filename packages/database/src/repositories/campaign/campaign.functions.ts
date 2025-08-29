import { CommandParser } from '@redis/client'
import {
  campaignKey,
  lureIndexKey,
  messageIndexKey,
  proxyIndexKey,
  redirectorIndexKey,
  sessionIndexKey,
  targetIndexKey
} from '../../database.keys.js'

export interface RawCampaign {
  description: string
  landing_secret: string
  landing_auth_path: string
  landing_auth_param: string
  landing_lure_param: string
  session_cookie_name: string
  session_expire: number
  new_session_expire: number
  session_limit: number
  session_emerge_idle_time: number
  session_emerge_limit: number
  message_expire: number
  message_limit: number
  message_emerge_idle_time: number
  message_emerge_limit: number
  message_lock_expire: number
  created_at: number
  updated_at: number
  proxy_count: number
  target_count: number
  redirector_count: number
  lure_count: number
  session_count: number
  message_count: number
}

export const campaignFunctions = {
  campaign: {
    create_campaign: {
      NUMBER_OF_KEYS: 1,

      parseCommand(
        parser: CommandParser,
        description: string,
        landing_secret: string,
        landing_auth_path: string,
        landing_auth_param: string,
        landing_lure_param: string,
        session_cookie_name: string,
        session_expire: number,
        new_session_expire: number,
        session_limit: number,
        session_emerge_idle_time: number,
        session_emerge_limit: number,
        message_expire: number,
        message_limit: number,
        message_emerge_idle_time: number,
        message_emerge_limit: number,
        message_lock_expire: number
      ) {
        parser.pushKey(campaignKey())

        parser.push(description)
        parser.push(landing_secret)
        parser.push(landing_auth_path)
        parser.push(landing_auth_param)
        parser.push(landing_lure_param)
        parser.push(session_cookie_name)
        parser.push(session_expire.toString())
        parser.push(new_session_expire.toString())
        parser.push(session_limit.toString())
        parser.push(session_emerge_idle_time.toString())
        parser.push(session_emerge_limit.toString())
        parser.push(message_expire.toString())
        parser.push(message_limit.toString())
        parser.push(message_emerge_idle_time.toString())
        parser.push(message_emerge_limit.toString())
        parser.push(message_lock_expire.toString())
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_campaign: {
      NUMBER_OF_KEYS: 7,

      parseCommand(parser: CommandParser) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyIndexKey())
        parser.pushKey(targetIndexKey())
        parser.pushKey(redirectorIndexKey())
        parser.pushKey(lureIndexKey())
        parser.pushKey(sessionIndexKey())
        parser.pushKey(messageIndexKey())
      },

      transformReply: undefined as unknown as () => RawCampaign | null
    },

    update_campaign: {
      NUMBER_OF_KEYS: 1,

      parseCommand(
        parser: CommandParser,
        description: string | null | undefined,
        session_expire: number | null | undefined,
        new_session_expire: number | null | undefined,
        session_limit: number | null | undefined,
        session_emerge_idle_time: number | null | undefined,
        session_emerge_limit: number | null | undefined,
        message_expire: number | null | undefined,
        message_limit: number | null | undefined,
        message_emerge_idle_time: number | null | undefined,
        message_emerge_limit: number | null | undefined,
        message_lock_expire: number | null | undefined
      ) {
        parser.pushKey(campaignKey())

        if (description != null) {
          parser.push('description')
          parser.push(description)
        }

        if (session_expire != null) {
          parser.push('session_expire')
          parser.push(session_expire.toString())
        }

        if (new_session_expire != null) {
          parser.push('new_session_expire')
          parser.push(new_session_expire.toString())
        }

        if (session_limit != null) {
          parser.push('session_limit')
          parser.push(session_limit.toString())
        }

        if (session_emerge_idle_time != null) {
          parser.push('session_emerge_idle_time')
          parser.push(session_emerge_idle_time.toString())
        }

        if (session_emerge_limit != null) {
          parser.push('session_emerge_limit')
          parser.push(session_emerge_limit.toString())
        }

        if (message_expire != null) {
          parser.push('message_expire')
          parser.push(message_expire.toString())
        }

        if (message_limit != null) {
          parser.push('message_limit')
          parser.push(message_limit.toString())
        }

        if (message_emerge_idle_time != null) {
          parser.push('message_emerge_idle_time')
          parser.push(message_emerge_idle_time.toString())
        }

        if (message_emerge_limit != null) {
          parser.push('message_emerge_limit')
          parser.push(message_emerge_limit.toString())
        }

        if (message_lock_expire != null) {
          parser.push('message_lock_expire')
          parser.push(message_lock_expire.toString())
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_campaign: {
      NUMBER_OF_KEYS: 7,

      parseCommand(parser: CommandParser) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyIndexKey())
        parser.pushKey(targetIndexKey())
        parser.pushKey(redirectorIndexKey())
        parser.pushKey(lureIndexKey())
        parser.pushKey(sessionIndexKey())
        parser.pushKey(messageIndexKey())
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
