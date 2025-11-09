import { HttpServerConfig, HttpServerOptions } from './http-server.js'

export function buildOptions(config: HttpServerConfig): HttpServerOptions {
  return {
    address: config.HTTP_SERVER_ADDRESS,
    port: config.HTTP_SERVER_PORT,
    bodyLimit: config.HTTP_SERVER_BODY_LIMIT,
    errorPage: config.HTTP_SERVER_ERROR_PAGE
  }
}

export const DEFAULT_ERROR_PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Error</title>
  </head>
  <body>
    <div>
      <h1><%= data.status %></h1>
      <p><%= data.message %></p>
    </div>
  </body>
</html>`
