import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'

/**
 * Represents the message model.
 *
 * @category Message
 */
export class MessageModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends MessageModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new message model instance.
   *
   * @param campaignId - The ID of the campaign this message belongs to.
   * @param messageId - The unique identifier for the message.
   * @param proxyId - The ID of the proxy that processed this message.
   * @param targetId - The ID of the target that handled this message.
   * @param sessionId - The ID of the session that generated this message.
   * @param type - The message type.
   * @param method - The HTTP method.
   * @param url - The HTTP request URL.
   * @param status - The HTTP status code.
   * @param analyze - The analyze identifier.
   * @param startTime - The start processing timestamp.
   * @param finishTime - The finish processing timestamp.
   * @param createdAt - The date and time when the message was created.
   */
  constructor(
    readonly campaignId: string,
    readonly messageId: string,
    readonly proxyId: string,
    readonly targetId: string,
    readonly sessionId: string,
    readonly type: HttpType,
    readonly method: HttpMethod,
    readonly url: string,
    readonly status: number,
    readonly analyze: string,
    readonly startTime: number,
    readonly finishTime: number,
    readonly createdAt: Date
  ) {}

  /**
   * Calculates the total processing time of the message.
   *
   * @returns The difference between `finishTime` and `startTime`.
   */
  get totalTime(): number {
    return this.finishTime > this.startTime ? this.finishTime - this.startTime : 0
  }
}

/**
 * Represents the full message model.
 *
 * @category Message
 */
export class FullMessageModel extends MessageModel {
  /**
   * Creates a new full message model instance.
   *
   * @param campaignId - The ID of the campaign this message belongs to.
   * @param messageId - The unique identifier for the message.
   * @param proxyId - The ID of the proxy that processed this message.
   * @param targetId - The ID of the target that handled this message.
   * @param sessionId - The ID of the session that generated this message.
   * @param type - The message type.
   * @param method - The HTTP method.
   * @param url - The HTTP request URL.
   * @param requestHeaders - The HTTP request headers.
   * @param requestBody - The HTTP request body.
   * @param status - The HTTP status code.
   * @param responseHeaders - The HTTP response headers.
   * @param responseBody - The HTTP response body.
   * @param connection - The connection details.
   * @param payload - The payload data extracted from the transaction.
   * @param errors - The list of errors that occurred during processing.
   * @param analyze - The analyze identifier.
   * @param startTime - The start processing timestamp.
   * @param finishTime - The finish processing timestamp.
   * @param createdAt - The date and time when the message was created.
   */
  constructor(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    type: HttpType,
    method: HttpMethod,
    url: string,
    readonly requestHeaders: HttpHeaders,
    readonly requestBody: HttpBody,
    status: number,
    readonly responseHeaders: HttpHeaders,
    readonly responseBody: HttpBody,
    readonly connection: HttpConnection,
    readonly payload: HttpPayload,
    readonly errors: HttpError[],
    analyze: string,
    startTime: number,
    finishTime: number,
    createdAt: Date
  ) {
    super(
      campaignId,
      messageId,
      proxyId,
      targetId,
      sessionId,
      type,
      method,
      url,
      status,
      analyze,
      startTime,
      finishTime,
      createdAt
    )
  }

  /**
   * Determines if there are errors in the message.
   *
   * @returns `true` if there are errors, `false` otherwise.
   */
  get hasErrors(): boolean {
    return this.errors.length > 0
  }
}
