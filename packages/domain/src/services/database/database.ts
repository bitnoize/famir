export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]
