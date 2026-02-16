export const HTTP_KINDS = ['simple', 'stream'] as const
export type HttpKind = (typeof HTTP_KINDS)[number]

export type HttpConnection = Record<string, number | string | null | undefined>
export type HttpPayload = Record<string, unknown>
export type HttpError = readonly [object, ...string[]]
