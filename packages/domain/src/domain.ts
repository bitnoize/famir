export const REPOSITORY_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

export type RepositoryStatusCode = (typeof REPOSITORY_STATUS_CODES)[number]
export type RepositoryErrorCode = Omit<RepositoryStatusCode, 'OK'>

export type RepositoryContainer<T> =
  | [true, T, 'OK', string]
  | [false, null, RepositoryErrorCode, string]
