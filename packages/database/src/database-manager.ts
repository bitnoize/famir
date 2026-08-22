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
   * @throws {@link DatabaseError} If the operation fails.
   */
  loadFunctions(): Promise<void>

  /**
   * Retrieves the database information.
   *
   * @throws {@link DatabaseError} If the operation fails.
   */
  getInfo(): Promise<string[]>
}
