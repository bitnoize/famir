/**
 * Arguments for creating a lure.
 *
 * @category Lure
 * @internal
 */
export interface CreateLureArgs {
  _: [string, string, string]
  path: string
  lockSecret: string
}

/**
 * Arguments for reading the lure.
 *
 * @category Lure
 * @internal
 */
export interface ReadLureArgs {
  _: [string, string]
}

/**
 * Arguments for toggling the lure.
 *
 * @category Lure
 * @internal
 */
export interface ToggleLureArgs {
  _: [string, string]
  lockSecret: string
}

/**
 * Arguments for deleting the lure.
 *
 * @category Lure
 * @internal
 */
export interface DeleteLureArgs {
  _: [string, string, string]
  lockSecret: string
}

/**
 * Arguments for listing lures.
 *
 * @category Lure
 * @internal
 */
export interface ListLuresArgs {
  _: [string]
}

/**
 * Arguments for making the lure url.
 *
 * @category Lure
 * @internal
 */
export interface MakeLureUrlArgs {
  _: [string, string, string]
  params: string
}
