/**
 * Represents the lure model.
 *
 * @category Lure
 */
export class LureModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends LureModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Type guard to check if a model is enabled.
   *
   * @param model - The model to check.
   * @returns `true` if the model is enabled, `false` otherwise.
   */
  static isEnabled = <T extends LureModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  /**
   * Creates a new lure model instance.
   *
   * @param campaignId - The ID of the campaign this lure belongs to.
   * @param lureId - The unique identifier for the lure.
   * @param path - The URL path for the lure.
   * @param redirectorId - The ID of the redirector that handles this lure.
   * @param isEnabled - The flag indicating if the lure is currently active for request routing.
   * @param sessionCount - The total number of sessions processed through this lure.
   * @param createdAt - The date and time when the lure was created.
   */
  constructor(
    readonly campaignId: string,
    readonly lureId: string,
    readonly path: string,
    readonly redirectorId: string,
    readonly isEnabled: boolean,
    readonly sessionCount: number,
    readonly createdAt: Date
  ) {}
}

/**
 * Represents the enabled lure model.
 *
 * @category Lure
 */
export interface EnabledLureModel extends LureModel {
  /** Guaranteed to be `true` for enabled lures. */
  isEnabled: true
}
