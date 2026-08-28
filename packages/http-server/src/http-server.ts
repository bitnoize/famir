import { ConfigData } from '@famir/config'

/**
 * DI token for an http-server implementation.
 */
export const HTTP_SERVER = Symbol('HttpServer')

/**
 * Defines the public contract for an http-server.
 *
 * The server handles incoming HTTP requests and WebSocket connections,
 * processes them through a chain of middleware, and sends appropriate responses.
 */
export interface HttpServer {
  /**
   * Starts the server and begins accepting connections.
   *
   * @throws LifecycleError If the server cannot be started.
   */
  start(): Promise<void>

  /**
   * Stops the server and closes all active connections.
   *
   * @throws LifecycleError If the server cannot be stopped.
   */
  stop(): Promise<void>
}

/**
 * Settings for an http-server.
 */
export interface HttpServerSettings {
  /** Error page content. */
  errorPage: string
}

/**
 * Configuration for a Native http-server.
 */
export interface NativeHttpServerConfig extends ConfigData {
  /** Listening address. */
  HTTP_SERVER_ADDRESS: string
  /** Listening port. */
  HTTP_SERVER_PORT: number
  /** Verbose logging. */
  HTTP_SERVER_VERBOSE: boolean
}

/**
 * Default error page content.
 *
 * @internal
 */
export const HTTP_SERVER_DEFAULT_ERROR_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background-color: #f4f4f4;
      color: #2c3e50;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 16px;
    }

    .error-card {
      max-width: 560px;
      width: 100%;
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
      text-align: center;
      border: 1px solid #eaeef2;
    }

    .error-status {
      font-size: 6rem;
      font-weight: 600;
      line-height: 1.1;
      color: #3a4a5a;
      letter-spacing: -2px;
      margin-bottom: 0.75rem;
    }

    .error-message {
      font-size: 1.8rem;
      font-weight: 350;
      color: #4f5f6f;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      word-break: break-word;
    }

    @media (max-width: 480px) {
      .error-status {
          font-size: 4.5rem;
      }
      .error-message {
          font-size: 1.5rem;
      }
      .error-card {
          padding: 2rem 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="error-card">
    <div class="error-status"><%= data.status %></div>
    <div class="error-message"><%= data.message %></div>
  </div>
</body>
</html>`
