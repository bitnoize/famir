/**
 * Represents the proxy model.
 *
 * @category Proxy
 */
export class ProxyModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends ProxyModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Type guard to check if a model is enabled.
   *
   * @param model - The model to check.
   * @returns `true` if the model is enabled, `false` otherwise.
   */
  static isEnabled = <T extends ProxyModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  /**
   * Creates a new proxy model instance.
   *
   * @param campaignId - The ID of the campaign this proxy belongs to.
   * @param proxyId - The unique identifier for the proxy.
   * @param url - The upstream URL for the proxy.
   * @param isEnabled - The flag indicating if the proxy is currently active for traffic routing.
   * @param messageCount - The total number of messages processed through this proxy.
   * @param createdAt - The date and time when the proxy was created.
   */
  constructor(
    readonly campaignId: string,
    readonly proxyId: string,
    readonly url: string,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date
  ) {}
}

/**
 * Represents the enabled proxy model.
 *
 * @category Proxy
 */
export interface EnabledProxyModel extends ProxyModel {
  /** Guaranteed to be `true` for enabled proxies. */
  isEnabled: true
}
