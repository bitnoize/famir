import { CommandParser } from '@redis/client'
import { campaignKey, messageKey, proxyKey, sessionKey, targetKey } from '../../database.keys.js'

export interface RawMessage {
  campaign_id: string
  message_id: string
  proxy_id: string
  target_id: string
  session_id: string
  type: string
  method: string
  url: string
  status: number
  processor: string
  start_time: number
  finish_time: number
  created_at: number
}

export interface RawFullMessage extends RawMessage {
  request_headers: string
  request_body: string
  response_headers: string
  response_body: string
  connection: string
  payload: string
  errors: string
}

export const messageFunctions = {
  message: {
    create_message: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        messageId: string,
        proxyId: string,
        targetId: string,
        sessionId: string,
        type: string,
        method: string,
        url: string,
        requestHeaders: string,
        requestBody: string,
        status: string,
        responseHeaders: string,
        responseBody: string,
        connection: string,
        payload: string,
        errors: string,
        processor: string,
        startTime: string,
        finishTime: string,
        createdAt: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))

        parser.push(campaignId)
        parser.push(messageId)
        parser.push(proxyId)
        parser.push(targetId)
        parser.push(sessionId)
        parser.push(type)
        parser.push(method)
        parser.push(url)
        parser.push(requestHeaders)
        parser.push(requestBody)
        parser.push(status)
        parser.push(responseHeaders)
        parser.push(responseBody)
        parser.push(connection)
        parser.push(payload)
        parser.push(errors)
        parser.push(processor)
        parser.push(startTime)
        parser.push(finishTime)
        parser.push(createdAt)
      },

      transformReply: undefined as unknown as () => unknown
    },

    create_dummy_message: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        messageId: string,
        proxyId: string,
        targetId: string,
        sessionId: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_message: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, messageId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_full_message: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, messageId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
