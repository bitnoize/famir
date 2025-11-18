export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]

export const DATABASE_CONNECTOR = Symbol('DatabaseConnector')

export interface DatabaseConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  connect(): Promise<void>
  close(): Promise<void>
}
