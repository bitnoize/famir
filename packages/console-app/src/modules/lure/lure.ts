/**
 * @category Lure
 * @internal
 */
export interface CreateLureArgs {
  _: [string, string, string]
  path: string
}

/**
 * @category Lure
 * @internal
 */
export interface ReadLureArgs {
  _: [string, string]
}

/**
 * @category Lure
 * @internal
 */
export interface ToggleLureArgs {
  _: [string, string]
}

/**
 * @category Lure
 * @internal
 */
export interface DeleteLureArgs {
  _: [string, string, string]
}

/**
 * @category Lure
 * @internal
 */
export interface ListLuresArgs {
  _: [string]
}

/**
 * @category Lure
 * @internal
 */
export interface MakeLureUrlArgs {
  _: [string, string, string]
  params: string
}
