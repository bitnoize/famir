/**
 * Key-value map of parameters for template rendering.
 *
 * @category Redirector
 */
export type RedirectorParams = Record<string, string>

/**
 * Represents a redirector model.
 *
 * @category Redirector
 */
export class RedirectorModel {
  /**
   * Type guard to filter out null values in arrays.
   *
   * @param model - The model to check
   * @returns `true` if the model is not null, `false` otherwise
   */
  static isNotNull = <T extends RedirectorModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new redirector model instance.
   *
   * @param campaignId - The ID of the campaign this redirector belongs to
   * @param redirectorId - The unique identifier of the redirector
   * @param lureCount - Number of lures pointing to this redirector
   * @param createdAt - The date and time when the redirector was created
   */
  constructor(
    readonly campaignId: string,
    readonly redirectorId: string,
    readonly lureCount: number,
    readonly createdAt: Date
  ) {}
}

/**
 * Represents a full redirector model.
 *
 * @category Redirector
 */
export class FullRedirectorModel extends RedirectorModel {
  /**
   * Creates a new full redirector model instance.
   *
   * @param campaignId - The ID of the campaign this redirector belongs to
   * @param redirectorId - The unique identifier of the redirector
   * @param page - The page template
   * @param fields - Array of required field names
   * @param lureCount - Number of lures pointing to this redirector
   * @param createdAt - The date and time when the redirector was created
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
   * Indicates whether this redirector is "loose" (has no required fields).
   *
   * Loose redirectors accept any parameters without validation.
   *
   * @returns `true` if there are no required fields, `false` otherwise
   */
  get isLoose(): boolean {
    return this.fields.length === 0
  }

  /**
   * Checks if the provided parameters satisfy all required fields.
   *
   * If the redirector is loose (`isLoose === true`), this always returns `true`.
   * Otherwise, it checks that every required field exists in the parameters
   * and has a non-null, non-empty value.
   *
   * @param params - The key-value parameters to check
   * @returns `true` if all required fields are present, `false` otherwise
   */
  checkParams(params: RedirectorParams): boolean {
    return this.isLoose || this.fields.every((field) => params[field] != null)
  }
}
