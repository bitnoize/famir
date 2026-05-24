import { HttpServerContext } from './http-server-context.js'

/**
 * Function to continue execution of the middleware chain.
 */
export type HttpServerNextFunction = () => Promise<void>

/**
 * Function for handling middleware.
 *
 * @param ctx - The shared state across the connection lifecycle.
 * @param next - Function to continue the processing chain.
 */
export type HttpServerMiddleware = (
  ctx: HttpServerContext,
  next: HttpServerNextFunction
) => Promise<void>
