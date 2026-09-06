import { DIContainer } from '@famir/common'
import http from 'node:http'
import type WebSocket from 'ws'
import {
  HttpServerContext,
  HttpServerContextState,
  HttpServerNormalContext,
  HttpServerWebSocketContext,
} from './http-server-context.js'

/**
 * DI token for an http-server context factory implementation.
 */
export const HTTP_SERVER_CONTEXT_FACTORY = Symbol('HttpServerContextFactory')

/**
 * Represents the http-server context factory.
 *
 * Separates context creation logic from the main server implementation.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { HttpServerContextFactory } from '@famir/http-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * HttpServerContextFactory.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { HTTP_SERVER_CONTEXT_FACTORY, type HttpServerContextFactory } from '@famir/http-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve from DI container
 * const contextFactory = container.resolve<HttpServerContextFactory>(HTTP_SERVER_CONTEXT_FACTORY)
 *
 * const verbose = false
 * const errorPage = `...`
 *
 * // create Normal context
 * const ctx = contextFactory.createNormal(req, res, { verbose, errorPage })
 *
 * // create WebSocket context
 * const ctx = contextFactory.createWebSocket(ws, req, { verbose, errorPage })
 *
 * ```
 */
export class HttpServerContextFactory {
  /**
   * Registers the context factory as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<HttpServerContextFactory>(
      HTTP_SERVER_CONTEXT_FACTORY,
      () => new HttpServerContextFactory()
    )
  }

  /**
   * Creates a context for a normal HTTP request.
   *
   * @param req - The server request object.
   * @param res - The server response object.
   * @param state - The context shared state.
   * @returns The created HTTP context.
   */
  createNormal(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    state: HttpServerContextState
  ): HttpServerContext {
    return new HttpServerNormalContext(req, res, state)
  }

  /**
   * Creates a context for a WebSocket connection.
   *
   * @param ws - The WebSocket connection.
   * @param req - The server request object.
   * @param state - The context shared state.
   * @returns The created HTTP context.
   */
  createWebSocket(
    ws: WebSocket,
    req: http.IncomingMessage,
    state: HttpServerContextState
  ): HttpServerContext {
    return new HttpServerWebSocketContext(ws, req, state)
  }
}
