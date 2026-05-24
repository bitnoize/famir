/**
 * DI token for a database manager implementation.
 *
 * @category none
 */
export const DATABASE_MANAGER = Symbol('DatabaseManager')

/**
 * Defines the public contract for a database manager.
 *
 * The manager is responsible for administrative database operations such as
 * loading custom functions and performing cleanup tasks.
 *
 * @category none
 */
export interface DatabaseManager {
  /**
   * Loads all custom functions into the database.
   *
   * This method registers the application's custom Redis functions.
   *
   * @throws {@link DatabaseError} If the functions cannot be loaded.
   */
  loadFunctions(): Promise<void>

  /**
   * Cleans up the entire database.
   *
   * This method removes all data and should be used with caution.
   *
   * @throws {@link DatabaseError} If the cleanup operation fails.
   */
  cleanup(): Promise<void>
}
