/**
 * Arguments for loading database functions.
 *
 * @category Database
 * @internal
 */
export interface LoadDatabaseFunctionsArgs {
  _: string[]
  force: boolean
}

/**
 * Arguments for cleaning up the database.
 *
 * @category Database
 * @internal
 */
export interface CleanupDatabaseArgs {
  _: string[]
  force: boolean
}
