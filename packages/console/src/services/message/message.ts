export const MESSAGE_SERVICE = Symbol('MessageService')

export interface ReadMessageData {
  campaignId: string
  messageId: string
}
