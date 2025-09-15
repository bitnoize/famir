export interface DatabaseConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  connect(): Promise<void>
  close(): Promise<void>
}

export const REPOSITORY_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

export type RepositoryStatusCode = (typeof REPOSITORY_STATUS_CODES)[number]
export type RepositoryErrorCode = Omit<RepositoryStatusCode, 'OK'>

export type RepositoryContainer<T> =
  | [true, T, 'OK', string]
  | [false, null, RepositoryErrorCode, string]
