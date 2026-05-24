/**
 * Key-value map of parameters for template rendering.
 *
 * @category Redirector
 */
export type RedirectorParams = Record<string, string>

/**
 * Represents the redirector model.
 *
 * @category Redirector
 */
export class RedirectorModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends RedirectorModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new redirector model instance.
   *
   * @param campaignId - The ID of the campaign this redirector belongs to.
   * @param redirectorId - The unique identifier for the redirector.
   * @param lureCount - The total number of lures pointing to this redirector.
   * @param createdAt - The date and time when the redirector was created.
   */
  constructor(
    readonly campaignId: string,
    readonly redirectorId: string,
    readonly lureCount: number,
    readonly createdAt: Date
  ) {}
}

/**
 * Represents the full redirector model.
 *
 * @category Redirector
 */
export class FullRedirectorModel extends RedirectorModel {
  /**
   * Creates a new full redirector model instance.
   *
   * @param campaignId - The ID of the campaign this redirector belongs to.
   * @param redirectorId - The unique identifier for the redirector.
   * @param page - The page template.
   * @param fields - The list of required field names for this redirector.
   * @param lureCount - The total number of lures pointing to this redirector.
   * @param createdAt - The date and time when the redirector was created.
   */
  constructor(
    campaignId: string,
    redirectorId: string,
    readonly page: string,
    readonly fields: string[],
    lureCount: number,
    createdAt: Date
  ) {
    super(campaignId, redirectorId, lureCount, createdAt)
  }

  /**
   * Indicates whether this redirector is 'loose'.
   *
   * A loose redirector has no required fields and accepts any parameters
   * without validation. This is useful for simple redirectors that don't
   * need to collect specific data.
   *
   * @returns `true` if there are no required fields, `false` otherwise.
   */
  get isLoose(): boolean {
    return this.fields.length === 0
  }

  /**
   * Checks if the provided parameters satisfy all required fields.
   *
   * If the redirector is loose (`isLoose === true`), this method always returns `true`.
   * Otherwise, it checks that every required field exists in the parameters
   * and has a non-null, non-empty string value.
   *
   * @param params - The key-value parameters to validate.
   * @returns `true` if all required fields are present and have values, `false` otherwise.
   */
  checkParams(params: RedirectorParams): boolean {
    if (this.isLoose) {
      return true
    }

    return this.fields.every((field) => {
      const value = params[field]
      return value != null && value.length > 0
    })
  }
}
