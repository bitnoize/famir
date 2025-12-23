export const DATABASE_MANAGER = Symbol('DatabaseManager')

export interface DatabaseManager {
  loadFunctions(): Promise<void>
  cleanup(): Promise<void>
}
