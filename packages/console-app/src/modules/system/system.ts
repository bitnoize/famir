/**
 * Arguments for assets.
 *
 * @category System
 * @internal
 */
export interface AssetsArgs {
  _: string[]
  assetName: string
}

/**
 * Arguments for get database info.
 *
 * @category System
 * @internal
 */
export interface GetDatabaseInfoArgs {
  _: string[]
}

/**
 * Arguments for loading database functions.
 *
 * @category System
 * @internal
 */
export interface LoadDatabaseFunctionsArgs {
  _: string[]
  force: boolean
}

/**
 * Arguments for get producer info.
 *
 * @category System
 * @internal
 */
export interface GetProducerInfoArgs {
  _: string[]
}

/**
 * Arguments for get edge-server info.
 *
 * @category System
 * @internal
 */
export interface GetEdgeServerInfoArgs {
  _: string[]
}
