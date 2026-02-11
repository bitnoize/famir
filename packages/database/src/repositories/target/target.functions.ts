import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  targetIndexKey,
  targetKey,
  targetLabelsKey,
  targetUniqueDonorKey,
  targetUniqueMirrorKey
} from '../../database.keys.js'

export interface RawTarget {
  campaign_id: string
  target_id: string
  is_landing: number
  donor_secure: number
  donor_sub: string
  donor_domain: string
  donor_port: number
  mirror_secure: number
  mirror_sub: string
  mirror_domain: string
  mirror_port: number
  labels: string[]
  is_enabled: number
  message_count: number
  created_at: number
  updated_at: number
}

export interface RawFullTarget extends RawTarget {
  connect_timeout: number
  ordinary_timeout: number
  streaming_timeout: number
  request_body_limit: number
  response_body_limit: number
  main_page: string
  not_found_page: string
  favicon_ico: string
  robots_txt: string
  sitemap_xml: string
}

export const targetFunctions = {
  target: {
    create_target: {
      NUMBER_OF_KEYS: 6,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        isLanding: boolean,
        donorSecure: boolean,
        donorSub: string,
        donorDomain: string,
        donorPort: number,
        mirrorSecure: boolean,
        mirrorSub: string,
        mirrorPort: number,
        connectTimeout: number,
        ordinaryTimeout: number,
        streamingTimeout: number,
        requestBodyLimit: number,
        responseBodyLimit: number,
        mainPage: string,
        notFoundPage: string,
        faviconIco: string,
        robotsTxt: string,
        sitemapXml: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetUniqueDonorKey(prefix, campaignId))
        parser.pushKey(targetUniqueMirrorKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(targetId)
        parser.push(isLanding ? '1' : '0')
        parser.push(donorSecure ? '1' : '0')
        parser.push(donorSub)
        parser.push(donorDomain)
        parser.push(donorPort.toString())
        parser.push(mirrorSecure ? '1' : '0')
        parser.push(mirrorSub)
        parser.push(mirrorPort.toString())
        parser.push(connectTimeout.toString())
        parser.push(ordinaryTimeout.toString())
        parser.push(streamingTimeout.toString())
        parser.push(requestBodyLimit.toString())
        parser.push(responseBodyLimit.toString())
        parser.push(mainPage)
        parser.push(notFoundPage)
        parser.push(faviconIco)
        parser.push(robotsTxt)
        parser.push(sitemapXml)
        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    },

    read_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => RawTarget | null
    },

    read_full_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => RawTarget | null
    },

    read_target_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    update_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        connectTimeout: number | null | undefined,
        ordinaryTimeout: number | null | undefined,
        streamingTimeout: number | null | undefined,
        requestBodyLimit: number | null | undefined,
        responseBodyLimit: number | null | undefined,
        mainPage: string | null | undefined,
        notFoundPage: string | null | undefined,
        faviconIco: string | null | undefined,
        robotsTxt: string | null | undefined,
        sitemapXml: string | null | undefined,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        if (connectTimeout != null) {
          parser.push('connect_timeout')
          parser.push(connectTimeout.toString())
        }

        if (ordinaryTimeout != null) {
          parser.push('ordinary_timeout')
          parser.push(ordinaryTimeout.toString())
        }

        if (streamingTimeout != null) {
          parser.push('streaming_timeout')
          parser.push(streamingTimeout.toString())
        }

        if (requestBodyLimit != null) {
          parser.push('request_body_limit')
          parser.push(requestBodyLimit.toString())
        }

        if (responseBodyLimit != null) {
          parser.push('response_body_limit')
          parser.push(responseBodyLimit.toString())
        }

        if (mainPage != null) {
          parser.push('main_page')
          parser.push(mainPage)
        }

        if (notFoundPage != null) {
          parser.push('not_found_page')
          parser.push(notFoundPage)
        }

        if (faviconIco != null) {
          parser.push('favicon_ico')
          parser.push(faviconIco)
        }

        if (robotsTxt != null) {
          parser.push('robots_txt')
          parser.push(robotsTxt)
        }

        if (sitemapXml != null) {
          parser.push('sitemap_xml')
          parser.push(sitemapXml)
        }

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    },

    enable_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    },

    disable_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    },

    append_target_label: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        label: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))

        parser.push(label.toLowerCase())
        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    },

    remove_target_label: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        label: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))

        parser.push(label.toLowerCase())
        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    },

    delete_target: {
      NUMBER_OF_KEYS: 7,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
        parser.pushKey(targetUniqueDonorKey(prefix, campaignId))
        parser.pushKey(targetUniqueMirrorKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
