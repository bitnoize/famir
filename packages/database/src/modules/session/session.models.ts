/**
 * Parameters for upgrading a session.
 *
 * @category Session
 */
export interface UpgradeSessionParams {
  lure_id: string
  session_id: string
  secret: string
  back_url: string
}

/**
 * Represents the session model.
 *
 * @category Session
 */
export class SessionModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends SessionModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new session model instance.
   *
   * @param campaignId - The ID of the campaign this session belongs to.
   * @param sessionId - The unique identifier for the session.
   * @param proxyId - The ID of the proxy assigned to this session.
   * @param secret - The session secret for secure operations.
   * @param isUpgraded - The flag indicating if the session has been upgraded.
   * @param messageCount - The total number of messages processed through this session.
   * @param createdAt - The date and time when the session was created.
   * @param authorizedAt - The date and time when the session was last authorized.
   */
  constructor(
    readonly campaignId: string,
    readonly sessionId: string,
    readonly proxyId: string,
    readonly secret: string,
    readonly isUpgraded: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly authorizedAt: Date
  ) {}

  /**
   * Indicates whether this session is considered 'new'.
   *
   * @returns `true` if the session has processed 0 or 1 messages, `false` otherwise.
   */
  get isNew(): boolean {
    return this.messageCount <= 1
  }
}
