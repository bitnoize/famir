import {
  MessageHeaders,
  MessageMethod,
  MessageRequestCookies,
  MessageResponseCookies
} from '../message/index.js'

export class MessageLog {
  constructor(
    readonly campaignId: string,
    readonly id: string,
    readonly proxyId: string,
    readonly targetId: string,
    readonly sessionId: string,
    readonly clientIp: string,
    readonly method: MessageMethod,
    readonly originUrl: string,
    readonly forwardUrl: string,
    readonly requestHeaders: MessageHeaders,
    readonly requestCookies: MessageRequestCookies,
    readonly requestBody: Buffer,
    readonly statusCode: number,
    readonly responseHeaders: MessageHeaders,
    readonly responseCookies: MessageResponseCookies,
    readonly responseBody: Buffer,
    readonly queryTime: number,
    readonly score: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}
