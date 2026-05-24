import { DIContainer } from '@famir/common'

/**
 * DI token for the http-server assets.
 */
export const HTTP_SERVER_ASSETS = Symbol('HttpServerAssets')

/**
 * Represents the http-server assets.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { HTTP_SERVER_ASSETS, HttpServerAssets } from '@famir/http-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Define your assets
 * const assets: [string, string][] = [
 *   [
 *     'error-page.html',
 *     `<html><body><center><%= data.status %> <%= data.message %></center></body></html>`
 *   ]
 * ]
 *
 * // Register in DI container
 * HttpServerAssets.register(container, assets)
 *
 * // Resolve from DI container
 * const assets = container.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
 * ```
 */
export class HttpServerAssets extends Map<string, string> {
  /**
   * Registers the assets as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   * @param assets - The list of key-value pairs.
   */
  static register(container: DIContainer, assets: [string, string][]) {
    container.registerSingleton<HttpServerAssets>(
      HTTP_SERVER_ASSETS,
      () => new HttpServerAssets(assets)
    )
  }

  /**
   * Resolves the assets from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The assets instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
  }
}

/**
 * Default error page content.
 *
 * @internal
 */
export const HTTP_SERVER_ASSET_ERROR_PAGE = `<!doctype html>
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
