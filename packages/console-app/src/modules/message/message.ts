/**
 * @category Message
 * @internal
 */
export interface ReadMessageArgs {
  _: [string, string]
  showHeaders: boolean
  showConnection: boolean
  showPayload: boolean
}

/**
 * @category Message
 * @internal
 */
export interface DeleteMessageArgs {
  _: [string, string]
}

/**
 * @category Message
 * @internal
 */
export interface ListMessagesArgs {
  _: [string]
  limit: number
}

/**
 * @category Message
 * @internal
 */
export interface ClearMessagesArgs {
  _: [string]
}
