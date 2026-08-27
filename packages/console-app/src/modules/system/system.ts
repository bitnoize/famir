/**
 * @category System
 * @internal
 */
export interface AssetsArgs {
  _: string[]
  assetName: string
}

/**
 * @category System
 * @internal
 */
export interface GetDatabaseInfoArgs {
  _: string[]
}

/**
 * @category System
 * @internal
 */
export interface LoadDatabaseFunctionsArgs {
  _: string[]
  force: boolean
}

/**
 * @category System
 * @internal
 */
export interface CleanupDatabaseArgs {
  _: string[]
  force: boolean
}

/**
 * @category System
 * @internal
 */
export interface GetProducerInfoArgs {
  _: string[]
}

/**
 * @category System
 * @internal
 */
export interface UpsertEdgeServerConfigArgs {
  _: string[]
  assetName: string
  force: boolean
}

/**
 * @category System
 * @internal
 */
export interface ReadEdgeServerConfigArgs {
  _: string[]
}

/**
 * @category System
 * @internal
 */
export interface DeleteEdgeServerConfigArgs {
  _: string[]
  force: boolean
}

/**
 * @category System
 * @internal
 */
export interface ReadEdgeServerUpstreamsArgs {
  _: string[]
}
