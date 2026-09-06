/**
 * DI token for a database manager implementation.
 *
 * @category Database Service
 */
export const DATABASE_MANAGER = Symbol('DatabaseManager')

/**
 * Defines the public contract for a database manager.
 *
 * The manager is responsible for administrative database operations such as
 * loading custom functions and performing cleanup tasks.
 *
 * @category Database Service
 */
export interface DatabaseManager {
  /**
   * Retrieves the database information.
   *
   * @throws DatabaseError If the operation fails.
   */
  getInfo(): Promise<string[]>

  /**
   * Loads all custom functions into the database.
   *
   * @throws DatabaseError If the operation fails.
   */
  loadFunctions(): Promise<void>

  /**
   * Cleans up the entire database.
   *
   * This method removes all data and should be used with caution.
   *
   * @throws DatabaseError If the cleanup operation fails.
   */
  cleanup(): Promise<void>
}
