import { HttpType, TargetAccessLevel } from '@famir/domain'
import { HttpServerContextType, HttpServerMiddleware } from '@famir/http-server'

/**
 * Represents the reverse dispatch table by HTTP type.
 *
 * @category none
 */
export type ReverseDispatchHttpType = Record<HttpType, HttpServerMiddleware>

/**
 * Represents the reverse dispatch table by context type.
 *
 * @category none
 */
export type ReverseDispatchContextType = Record<HttpServerContextType, HttpServerMiddleware>

/**
 * Represents the reverse dispatch table by target access level.
 *
 * @category none
 */
export type ReverseDispatchTargetAccessLevel = Record<TargetAccessLevel, HttpServerMiddleware>
